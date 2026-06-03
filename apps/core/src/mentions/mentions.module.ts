import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Profile } from '../entities/profile.entity';
import { MentionsService } from './mentions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profile])],
  providers: [MentionsService],
  exports: [MentionsService],
})
export class MentionsModule {}
