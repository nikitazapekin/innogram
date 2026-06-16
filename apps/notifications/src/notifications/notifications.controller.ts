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
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@innogram/shared';

import { NotificationDto } from './dto/notification.dto';
import { UpdateNotificationReadDto } from './dto/update-notification-read.dto';
import { NotificationsService } from './notifications.service';

@Public()
@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for a profile' })
  @ApiQuery({ name: 'recipientProfileId', type: Number, required: true })
  @ApiOkResponse({ description: 'Notifications retrieved successfully.', type: [NotificationDto] })
  findAll(@Query('recipientProfileId', ParseIntPipe) recipientProfileId: number) {
    return this.notificationsService.findByRecipient(recipientProfileId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification read state' })
  @ApiOkResponse({ description: 'Notification updated successfully.', type: NotificationDto })
  @ApiNotFoundResponse({ description: 'Notification was not found.' })
  updateReadState(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateNotificationReadDto,
  ): Promise<NotificationDto> {
    return this.notificationsService.updateReadState(id, body.read);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiNoContentResponse({ description: 'Notification deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Notification was not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.notificationsService.remove(id);
  }
}
