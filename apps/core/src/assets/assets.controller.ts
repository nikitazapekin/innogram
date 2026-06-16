import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '@innogram/shared';

import {
  createTempDiskStorage,
  DEFAULT_UPLOAD_FILE_SIZE_LIMIT,
} from '../common/upload/upload.config';
import { AssetDto } from './dto/asset.dto';
import { AssetsService } from './assets.service';

@ApiTags('assets')
@ApiBearerAuth('access-token')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get(':id/url')
  @ApiOperation({ summary: 'Get a presigned URL for an asset' })
  @ApiOkResponse({ description: 'Asset URL retrieved successfully.', type: String })
  @ApiNotFoundResponse({ description: 'Asset was not found.' })
  getAssetUrl(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.assetsService.getAssetUrl(id);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({ description: 'File uploaded successfully.', type: AssetDto })
  @ApiBadRequestResponse({ description: 'File is required or invalid.' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createTempDiskStorage(),
      limits: { fileSize: DEFAULT_UPLOAD_FILE_SIZE_LIMIT },
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: AuthenticatedRequest,
  ): Promise<AssetDto> {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    return this.assetsService.uploadFile(file, request.user!.email);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiNotFoundResponse({ description: 'Asset was not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.assetsService.remove(id);
  }
}
