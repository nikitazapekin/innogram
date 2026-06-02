import { IsBoolean } from 'class-validator';

export class UpdateNotificationReadDto {
  @IsBoolean()
  read: boolean;
}
