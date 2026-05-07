import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AuthUserDto, UsersService } from '../users/users.service';

type FindUserByEmailMessage = Readonly<{
  email: string;
}>;

type CreateUserMessage = Readonly<{
  email: string;
  passwordHash: string;
}>;

@Controller()
export class AuthKafkaController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('auth.core.find-user-by-email')
  findUserByEmail(@Payload() message: FindUserByEmailMessage): Promise<AuthUserDto | null> {
    return this.usersService.findUserByEmail(message.email);
  }

  @MessagePattern('auth.core.create-user')
  createUser(@Payload() message: CreateUserMessage): Promise<AuthUserDto> {
    return this.usersService.createAuthUser(message.email, message.passwordHash);
  }
}
