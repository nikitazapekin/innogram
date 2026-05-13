import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthUserDto } from './dto/auth-user.dto';
import { CreateAuthUserDto } from './dto/create-auth-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user')
  createUser(@Body() createAuthUserDto: CreateAuthUserDto): Promise<AuthUserDto> {
    return this.authService.createUser(createAuthUserDto);
  }

  @Get('user')
  getUserByEmail(@Query('email') email: string): Promise<AuthUserDto | null> {
    return this.authService.getUserByEmail(email);
  }
}
