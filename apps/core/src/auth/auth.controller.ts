import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { Public } from '@innogram/shared';

import { AuthService } from './auth.service';
import { AuthUserDto } from './dto/auth-user.dto';
import { CreateAuthUserDto } from './dto/create-auth-user.dto';
import { GetAuthUserQueryDto } from './dto/get-auth-user-query.dto';
import { VerifyAuthUserCredentialsDto } from './dto/verify-auth-user-credentials.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user')
  createUser(@Body() createAuthUserDto: CreateAuthUserDto): Promise<AuthUserDto> {
    return this.authService.createUser(createAuthUserDto);
  }

  @Get('user')
  getUserByEmail(@Query() query: GetAuthUserQueryDto): Promise<AuthUserDto | null> {
    return this.authService.getUserByEmail(query.email);
  }

  @Delete('user/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.authService.deleteUser(id);
  }

  @Post('user/verify')
  verifyUserCredentials(
    @Body() verifyAuthUserCredentialsDto: VerifyAuthUserCredentialsDto,
  ): Promise<AuthUserDto | null> {
    return this.authService.verifyUserCredentials(verifyAuthUserCredentialsDto);
  }
}
