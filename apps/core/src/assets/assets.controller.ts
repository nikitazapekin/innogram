import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AssetDto } from './dto/asset.dto';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get(':id/url')
  getAssetUrl(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.assetsService.getAssetUrl(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('profileId', ParseIntPipe) profileId: number,
  ): Promise<AssetDto> {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    return this.assetsService.uploadFile(file, profileId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.assetsService.remove(id);
  }
}
