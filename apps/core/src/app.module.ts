import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { DatabaseConfigService } from './database.config';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { CommentsModule } from './comments/comments.module';
import { Account } from './entities/account.entity';
import { Asset } from './entities/asset.entity';
import { Chat } from './entities/chat.entity';
import { Comment } from './entities/comment.entity';
import { Message } from './entities/message.entity';
import { Notification } from './entities/notification.entity';
import { Post } from './entities/post.entity';
import { Profile } from './entities/profile.entity';
import { UserEntity } from './entities/user.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    TypeOrmModule.forFeature([
      Account,
      Asset,
      Chat,
      Comment,
      Message,
      Notification,
      Post,
      Profile,
      UserEntity,
    ]),
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    ChatsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
