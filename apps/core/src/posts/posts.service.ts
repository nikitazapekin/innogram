import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Post } from '../entities/post.entity';
import { UserEntity } from '../entities/user.entity';
import { ArchivedPost } from '../entities/archived-post.entity';
import { Notification } from '../entities/notification.entity';
import { AssetsService } from '../assets/assets.service';
import { NotificationEventsProducer } from '../kafka/notification-events.producer';
import { MentionsService } from '../mentions/mentions.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto, MediaDto } from './dto/post.dto';
import { PaginatedPostsDto } from './dto/paginated-posts.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

type PostWithCounts = Post & {
  likesCount?: number;
  dislikesCount?: number;
};

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ArchivedPost)
    private readonly archivedPostRepository: Repository<ArchivedPost>,
    private readonly assetsService: AssetsService,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly mentionsService: MentionsService,
    private readonly notificationEventsProducer: NotificationEventsProducer,
  ) {}

  async getPosts(): Promise<PostDto[]> {
    const posts = await this.buildPostsListQuery({ archived: false })
      .orderBy('post.createdAt', 'DESC')
      .getMany();

    return Promise.all(posts.map((post) => this.toPostDto(post)));
  }

  async getPostsByQuery(query: QueryPostsDto): Promise<PaginatedPostsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const filterQuery = this.buildPostsFilterQuery(query);
    const total = await filterQuery.getCount();

    const posts = await this.buildPostsListQuery(query)
      .orderBy(`post.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const postsDto = await Promise.all(posts.map((post) => this.toPostDto(post)));
    const totalPages = Math.ceil(total / limit);

    return {
      data: postsDto,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getPost(id: number): Promise<PostDto> {
    const post = await this.findPostById(id);

    return await this.toPostDto(post);
  }

  async createPost(createPostDto: CreatePostDto, email: string): Promise<PostDto> {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new UnauthorizedException('Authenticated user was not found.');
    }

    const post = this.postsRepository.create({
      authorProfileId: user.id,
      title: createPostDto.title,
      content: createPostDto.content,
    });

    const savedPost = await this.postsRepository.save(post);

    if (createPostDto.assetIds?.length) {
      await this.postsRepository
        .createQueryBuilder()
        .relation(Post, 'assets')
        .of(savedPost.id)
        .add(createPostDto.assetIds);
    }

    await this.handleMentions(savedPost);

    const postWithRelations = await this.findPostById(savedPost.id);

    return await this.toPostDto(postWithRelations);
  }

  async updatePost(id: number, updatePostDto: UpdatePostDto): Promise<PostDto> {
    const post = await this.findPostById(id);

    post.title = updatePostDto.title ?? post.title;
    post.content = updatePostDto.content ?? post.content;

    const savedPost = await this.postsRepository.save(post);

    return await this.toPostDto(savedPost);
  }

  async archivePost(id: number): Promise<PostDto> {
    const post = await this.findPostById(id);

    let archived = post.archivedPost;

    if (!archived) {
      archived = this.archivedPostRepository.create({ postId: id, isArchived: true });
      await this.archivedPostRepository.save(archived);
    }

    return await this.toPostDto(post, archived);
  }

  async unarchivePost(id: number): Promise<PostDto> {
    const post = await this.findPostById(id);

    if (post.archivedPost) {
      await this.archivedPostRepository.delete({ postId: id });
    }

    return await this.toPostDto(post);
  }

  async like(postId: number, profileId: number): Promise<void> {
    await this.ensurePostExists(postId);

    try {
      await this.postsRepository
        .createQueryBuilder()
        .relation(Post, 'likes')
        .of(postId)
        .add(profileId);
    } catch (error: unknown) {
      if (
        !(error instanceof QueryFailedError) ||
        (error as unknown as { driverError?: { code?: string } }).driverError?.code !== '23505'
      )
        throw error;
    }
  }

  async unlike(postId: number, profileId: number): Promise<void> {
    await this.ensurePostExists(postId);

    await this.postsRepository
      .createQueryBuilder()
      .relation(Post, 'likes')
      .of(postId)
      .remove(profileId);
  }

  async dislike(postId: number, profileId: number): Promise<void> {
    await this.ensurePostExists(postId);

    try {
      await this.postsRepository
        .createQueryBuilder()
        .relation(Post, 'dislikes')
        .of(postId)
        .add(profileId);
    } catch (error: unknown) {
      if (
        !(error instanceof QueryFailedError) ||
        (error as unknown as { driverError?: { code?: string } }).driverError?.code !== '23505'
      )
        throw error;
    }
  }

  async undislike(postId: number, profileId: number): Promise<void> {
    await this.ensurePostExists(postId);

    await this.postsRepository
      .createQueryBuilder()
      .relation(Post, 'dislikes')
      .of(postId)
      .remove(profileId);
  }

  async deletePost(id: number): Promise<void> {
    await this.archivedPostRepository.delete({ postId: id });

    const deleteResult = await this.postsRepository.delete(id);

    if (!deleteResult.affected) {
      throw new NotFoundException('Post was not found.');
    }
  }

  private buildPostsFilterQuery(query: QueryPostsDto) {
    const qb = this.postsRepository
      .createQueryBuilder('post')
      .leftJoin('post.archivedPost', 'archivedPost');

    if (query.archived === true) {
      qb.where('archivedPost.id IS NOT NULL');
    } else {
      qb.where('archivedPost.id IS NULL');
    }

    if (query.search) {
      qb.andWhere('post.title ILIKE :search', { search: `%${query.search}%` });
    }

    return qb;
  }

  private buildPostsListQuery(query: QueryPostsDto) {
    return this.buildPostsFilterQuery(query)
      .leftJoinAndSelect('post.assets', 'assets')
      .leftJoinAndSelect('post.archivedPost', 'archivedPost')
      .loadRelationCountAndMap('post.likesCount', 'post.likes')
      .loadRelationCountAndMap('post.dislikesCount', 'post.dislikes');
  }

  private async handleMentions(post: Post): Promise<void> {
    const mentions = await this.mentionsService.extractMentions(post.content);

    for (const mention of mentions) {
      if (mention.mentionedProfileId === post.authorProfileId) continue;

      const notification = this.notificationRepository.create({
        recipientProfileId: mention.mentionedProfileId,
        type: 'mention',
        payload: {
          sourceType: 'post',
          sourceId: post.id,
          authorProfileId: post.authorProfileId,
        },
      });

      await this.notificationRepository.save(notification);

      await this.notificationEventsProducer.emitMention({
        sourceType: 'post',
        sourceId: post.id,
        authorProfileId: post.authorProfileId,
        mentionedProfileId: mention.mentionedProfileId,
      });
    }
  }

  private async ensurePostExists(id: number): Promise<void> {
    const exists = await this.postsRepository.existsBy({ id });

    if (!exists) {
      throw new NotFoundException('Post was not found.');
    }
  }

  private async findPostById(id: number): Promise<PostWithCounts> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.assets', 'assets')
      .leftJoinAndSelect('post.archivedPost', 'archivedPost')
      .loadRelationCountAndMap('post.likesCount', 'post.likes')
      .loadRelationCountAndMap('post.dislikesCount', 'post.dislikes')
      .where('post.id = :id', { id })
      .getOne();

    if (!post) {
      throw new NotFoundException('Post was not found.');
    }

    return post;
  }

  private async toPostDto(post: PostWithCounts, archived?: ArchivedPost | null): Promise<PostDto> {
    const ap = archived ?? post.archivedPost;

    let media: MediaDto[] | undefined;

    if (post.assets?.length) {
      media = await Promise.all(
        post.assets.map(async (asset) => ({
          id: asset.id,
          type: asset.mimeType.startsWith('video/') ? ('video' as const) : ('image' as const),
          url: await this.assetsService.buildAssetUrl(asset),
        })),
      );
    }

    return {
      id: post.id,
      authorProfileId: post.authorProfileId,
      title: post.title,
      content: post.content,
      likesCount: post.likesCount ?? 0,
      dislikesCount: post.dislikesCount ?? 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isArchived: !!ap,
      archivedAt: ap?.archivedAt ?? null,
      media,
    };
  }
}
