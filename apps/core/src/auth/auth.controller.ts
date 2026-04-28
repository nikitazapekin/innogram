import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { AuthUserDto } from './dto/auth-user.dto';
import { FindAuthUserQueryDto } from './dto/find-auth-user-query.dto';
import { SaveAuthUserDto } from './dto/save-auth-user.dto';
import { AuthService } from './auth.service';

@ApiExcludeController()
@Controller('internal/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('users/by-email')
  findUserByEmail(@Query() query: FindAuthUserQueryDto): Promise<AuthUserDto> {
    return this.authService.findUserByEmail(query.email);
  }

  @Post('users/password')
  createPasswordUser(@Body() saveAuthUserDto: SaveAuthUserDto): Promise<AuthUserDto> {
    return this.authService.createPasswordUser(saveAuthUserDto);
  }

  @Post('users/oauth')
  @HttpCode(HttpStatus.OK)
  upsertOAuthUser(@Body() saveAuthUserDto: SaveAuthUserDto): Promise<AuthUserDto> {
    return this.authService.upsertOAuthUser(saveAuthUserDto);
  }
}
