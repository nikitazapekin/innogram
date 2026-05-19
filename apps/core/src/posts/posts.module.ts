import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Post } from '../entities/post.entity';
import { UserEntity } from '../entities/user.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, UserEntity])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
