import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly service: NotificationsService) {}

  @EventPattern('friend-request.created')
  async handleFriendRequestCreated(
    @Payload() data: { requestId: number; fromProfileId: number; toProfileId: number },
  ): Promise<void> {
    this.logger.log(`Received friend-request.created: ${JSON.stringify(data)}`);

    await this.service.create(data.toProfileId, 'friend-request.created', {
      requestId: data.requestId,
      fromProfileId: data.fromProfileId,
    });
  }

  @EventPattern('friend-request.approved')
  async handleFriendRequestApproved(
    @Payload() data: { requestId: number; fromProfileId: number; toProfileId: number },
  ): Promise<void> {
    this.logger.log(`Received friend-request.approved: ${JSON.stringify(data)}`);

    await this.service.create(data.fromProfileId, 'friend-request.approved', {
      requestId: data.requestId,
      byProfileId: data.toProfileId,
    });
  }

  @EventPattern('friend-request.rejected')
  async handleFriendRequestRejected(
    @Payload() data: { requestId: number; fromProfileId: number; toProfileId: number },
  ): Promise<void> {
    this.logger.log(`Received friend-request.rejected: ${JSON.stringify(data)}`);

    await this.service.create(data.fromProfileId, 'friend-request.rejected', {
      requestId: data.requestId,
      byProfileId: data.toProfileId,
    });
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
