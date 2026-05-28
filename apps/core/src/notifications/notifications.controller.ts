import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '@innogram/shared';

import { NotificationsService } from './notifications.service';

@Public()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post()
  create(
    @Body()
    body: {
      recipientProfileId: number;
      type: string;
      payload?: Record<string, unknown> | null;
    },
  ) {
    return this.service.create(body.recipientProfileId, body.type, body.payload ?? null);
  }

  @Get(':profileId')
  findAll(
    @Param('profileId') profileId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findByRecipient(
      Number(profileId),
      Number(page) || undefined,
      Number(limit) || undefined,
    );
  }

  @Get(':profileId/:id')
  findOne(@Param('profileId') profileId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id, Number(profileId));
  }

  @Patch(':profileId/:id')
  update(
    @Param('profileId') profileId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { read?: boolean },
  ) {
    if (body.read === true) return this.service.markRead(id, Number(profileId));
    if (body.read === false) return this.service.markUnread(id, Number(profileId));
    return this.service.findOne(id, Number(profileId));
  }

  @Delete(':profileId/:id')
  remove(@Param('profileId') profileId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id, Number(profileId));
  }
}
