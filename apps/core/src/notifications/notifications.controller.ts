import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { Public } from '@innogram/shared';

import { NotificationDto } from './dto/notification.dto';
import { UpdateNotificationReadDto } from './dto/update-notification-read.dto';
import { NotificationsService } from './notifications.service';

@Public()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Query('recipientProfileId', ParseIntPipe) recipientProfileId: number) {
    return this.notificationsService.findByRecipient(recipientProfileId);
  }

  @Patch(':id')
  updateReadState(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateNotificationReadDto,
  ): Promise<NotificationDto> {
    return this.notificationsService.updateReadState(id, body.read);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.notificationsService.remove(id);
  }
}
