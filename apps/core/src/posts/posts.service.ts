import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Post } from '../entities/post.entity';
import { UserEntity } from '../entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async getPosts(): Promise<PostDto[]> {
    const posts = await this.postsRepository.find({
      order: { createdAt: 'DESC' },
    });

    return posts.map((post) => this.toPostDto(post));
  }

  async getPost(id: number): Promise<PostDto> {
    const post = await this.findPostById(id);

    return this.toPostDto(post);
  }

  async createPost(createPostDto: CreatePostDto, authorEmail: string): Promise<PostDto> {
    const user = await this.usersRepository.findOneBy({ email: authorEmail });

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

    if (updatePostDto.title !== undefined) {
      post.title = updatePostDto.title;
    }

    if (updatePostDto.content !== undefined) {
      post.content = updatePostDto.content;
    }

    const savedPost = await this.postsRepository.save(post);

    return this.toPostDto(savedPost);
  }

  async deletePost(id: number): Promise<void> {
    await this.findPostById(id);

    const deleteResult = await this.postsRepository.delete(id);

    if (!deleteResult.affected) {
      throw new NotFoundException('Post was not found.');
    }
  }

  private async findPostById(id: number): Promise<Post> {
    const post = await this.postsRepository.findOneBy({ id });

    if (!post) {
      throw new NotFoundException('Post was not found.');
    }

    return post;
  }

  private toPostDto(post: Post): PostDto {
    return {
      id: post.id,
      authorProfileId: post.authorProfileId,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
