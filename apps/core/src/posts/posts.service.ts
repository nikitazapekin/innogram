import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, FindOptionsOrder } from 'typeorm';

import { Post } from '../entities/post.entity';
import { UserEntity } from '../entities/user.entity';
import { ArchivedPost } from '../entities/archived-post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { PaginatedPostsDto } from './dto/paginated-posts.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ArchivedPost)
    private readonly archivedPostRepository: Repository<ArchivedPost>,
  ) {}

  async getPosts(): Promise<PostDto[]> {
    const posts = await this.postsRepository.find({
      relations: ['archivedPost', 'likes'],
      order: { createdAt: 'DESC' },
    });

    return posts.filter((post) => !post.archivedPost).map((post) => this.toPostDto(post));
  }

  async getPostsByQuery(query: QueryPostsDto): Promise<PaginatedPostsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';
    const search = query.search;

    const where: FindOptionsWhere<Post> = {};

    if (search) {
      where.title = Like(`%${search}%`);
    }

    const order: FindOptionsOrder<Post> = { [sortBy]: sortOrder };

    let [posts, total] = await this.postsRepository.findAndCount({
      where,
      relations: ['archivedPost', 'likes'],
      order,
      skip: (page - 1) * limit,
      take: limit,
    });

    if (query.archived === undefined || query.archived === false) {
      posts = posts.filter((post) => !post.archivedPost);
      total = posts.length;
    } else {
      posts = posts.filter((post) => post.archivedPost);
      total = posts.length;
    }

    const postsDto = posts.map((post) => this.toPostDto(post));
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

    return this.toPostDto(post);
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

    return this.toPostDto(savedPost);
  }

  async updatePost(id: number, updatePostDto: UpdatePostDto): Promise<PostDto> {
    const post = await this.findPostById(id);

    post.title = updatePostDto.title ?? post.title;
    post.content = updatePostDto.content ?? post.content;

    const savedPost = await this.postsRepository.save(post);

    return this.toPostDto(savedPost);
  }

  async archivePost(id: number): Promise<PostDto> {
    const post = await this.findPostById(id);

    let archived = post.archivedPost;

    if (!archived) {
      archived = this.archivedPostRepository.create({ postId: id, isArchived: true });
      await this.archivedPostRepository.save(archived);
    }

    return this.toPostDto(post, archived);
  }

  async unarchivePost(id: number): Promise<PostDto> {
    const post = await this.findPostById(id);

    if (post.archivedPost) {
      await this.archivedPostRepository.delete({ postId: id });
    }

    return this.toPostDto(post);
  }

  async like(postId: number, profileId: number): Promise<void> {
    await this.findPostById(postId);
    await this.postsRepository
      .createQueryBuilder()
      .relation(Post, 'likes')
      .of(postId)
      .add(profileId);
  }

  async unlike(postId: number, profileId: number): Promise<void> {
    await this.findPostById(postId);
    await this.postsRepository
      .createQueryBuilder()
      .relation(Post, 'likes')
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

  private async findPostById(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['archivedPost', 'likes'],
    });

    if (!post) {
      throw new NotFoundException('Post was not found.');
    }

    return post;
  }

  private toPostDto(post: Post, archived?: ArchivedPost | null): PostDto {
    const ap = archived ?? post.archivedPost;

    return {
      id: post.id,
      authorProfileId: post.authorProfileId,
      title: post.title,
      content: post.content,
      likesCount: post.likes?.length,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isArchived: !!ap,
      archivedAt: ap.archivedAt,
    };
  }
}
