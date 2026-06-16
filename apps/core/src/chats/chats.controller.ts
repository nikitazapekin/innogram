import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@innogram/shared';

import {
  createChatDiskStorage,
  DEFAULT_UPLOAD_FILE_SIZE_LIMIT,
} from '../common/upload/upload.config';
import { AssetDto } from '../assets/dto/asset.dto';
import { ChatsService } from './chats.service';

@Public()
@ApiTags('chats')
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a chat attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        profileId: { type: 'integer' },
      },
      required: ['file', 'profileId'],
    },
  })
  @ApiCreatedResponse({ description: 'File uploaded successfully.', type: AssetDto })
  @ApiBadRequestResponse({ description: 'File or profileId is missing or invalid.' })
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
