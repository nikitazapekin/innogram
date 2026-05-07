import { Module } from '@nestjs/common';

import { AuthKafkaController } from './auth.kafka.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AuthKafkaController],
})
export class AuthModule {}
