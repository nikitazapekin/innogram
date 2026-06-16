import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '@innogram/shared';

import {
  createChatDiskStorage,
  DEFAULT_UPLOAD_FILE_SIZE_LIMIT,
} from '../common/upload/upload.config';
import { ChatsService } from './chats.service';

@Public()
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createChatDiskStorage(),
      limits: { fileSize: DEFAULT_UPLOAD_FILE_SIZE_LIMIT },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('profileId') profileId: string,
  ) {
    const asset = await this.chatsService.saveFile(file, Number(profileId));

    return asset;
  }
}
