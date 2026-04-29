import { Module } from '@nestjs/common';

import { AuthKafkaController } from './auth.kafka.controller';

@Module({
  controllers: [AuthKafkaController],
})
export class AuthModule {}
