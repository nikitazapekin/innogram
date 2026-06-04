import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Post } from '../entities/post.entity';
import { UserEntity } from '../entities/user.entity';
import { ArchivedPost } from '../entities/archived-post.entity';
import { AssetsModule } from '../assets/assets.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, UserEntity, ArchivedPost]), AssetsModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
