import { Account } from '../../src/entities/account.entity';
import { ArchivedPost } from '../../src/entities/archived-post.entity';
import { Asset } from '../../src/entities/asset.entity';
import { Chat } from '../../src/entities/chat.entity';
import { Comment } from '../../src/entities/comment.entity';
import { FollowRequest } from '../../src/entities/follow-request.entity';
import { Message } from '../../src/entities/message.entity';
import { Notification } from '../../src/entities/notification.entity';
import { Post } from '../../src/entities/post.entity';
import { Profile } from '../../src/entities/profile.entity';
import { UserEntity } from '../../src/entities/user.entity';

export const INTEGRATION_ENTITIES = [
  Account,
  ArchivedPost,
  Asset,
  Chat,
  Comment,
  FollowRequest,
  Message,
  Notification,
  Post,
  Profile,
  UserEntity,
];
