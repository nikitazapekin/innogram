import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { UserEntity } from '../entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PasswordService } from './password.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
  controllers: [UsersController],
  providers: [UsersService, PasswordService],
})
export class UsersModule {}
