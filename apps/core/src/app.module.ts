import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SharedAuthGuard, SharedAuthModule } from '@innogram/shared';

import { AssetsModule } from './assets/assets.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from './cache/cache.module';
import { readRequiredEnv } from './common/read-required-env';
import { buildTypeOrmOptions } from './database.config';
import { ChatsModule } from './chats/chats.module';
import { CommentsModule } from './comments/comments.module';
import { Account } from './entities/account.entity';
import { Asset } from './entities/asset.entity';
import { Chat } from './entities/chat.entity';
import { Comment } from './entities/comment.entity';
import { FollowRequest } from './entities/follow-request.entity';
import { Message } from './entities/message.entity';
import { Post } from './entities/post.entity';
import { Profile } from './entities/profile.entity';
import { UserEntity } from './entities/user.entity';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      ignoreEnvFile: true,
      isGlobal: true,
    }),
    SharedAuthModule.forRoot({
      authServiceUrl: readRequiredEnv('AUTH_SERVICE_URL'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: buildTypeOrmOptions,
    }),
    TypeOrmModule.forFeature([
      Account,
      Asset,
      Chat,
      Comment,
      FollowRequest,
      Message,
      Post,
      Profile,
      UserEntity,
    ]),
    CacheModule,
    AssetsModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    ChatsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SharedAuthGuard,
    },
  ],
})
export class AppModule {}
