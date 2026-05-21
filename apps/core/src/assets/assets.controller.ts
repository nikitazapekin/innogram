import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthenticatedRequest } from '@innogram/shared';

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
    @Req() request: AuthenticatedRequest,
  ): Promise<AssetDto> {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    return this.assetsService.uploadFile(file, request.user!.sub);
  }
}
