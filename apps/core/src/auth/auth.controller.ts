import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@innogram/shared';

import { AuthService } from './auth.service';
import { AuthUserDto } from './dto/auth-user.dto';
import { CreateAuthUserDto } from './dto/create-auth-user.dto';
import { GetAuthUserQueryDto } from './dto/get-auth-user-query.dto';
import { VerifyAuthUserCredentialsDto } from './dto/verify-auth-user-credentials.dto';

@Public()
@ApiTags('auth (internal)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user')
  @ApiOperation({ summary: 'Create an auth user (internal)' })
  @ApiCreatedResponse({ description: 'User created successfully.', type: AuthUserDto })
  @ApiBadRequestResponse({ description: 'Request body validation failed.' })
  createUser(@Body() createAuthUserDto: CreateAuthUserDto): Promise<AuthUserDto> {
    return this.authService.createUser(createAuthUserDto);
  }

  @Get('user')
  @ApiOperation({ summary: 'Get auth user by email (internal)' })
  @ApiOkResponse({ description: 'User retrieved successfully.', type: AuthUserDto })
  getUserByEmail(@Query() query: GetAuthUserQueryDto): Promise<AuthUserDto | null> {
    return this.authService.getUserByEmail(query.email);
  }

  @Delete('user/:id')
  @ApiOperation({ summary: 'Delete an auth user (internal)' })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.authService.deleteUser(id);
  }

  @Post('user/verify')
  @ApiOperation({ summary: 'Verify user credentials (internal)' })
  @ApiOkResponse({ description: 'Credentials verified.', type: AuthUserDto })
  @ApiBadRequestResponse({ description: 'Invalid credentials.' })
  verifyUserCredentials(
    @Body() verifyAuthUserCredentialsDto: VerifyAuthUserCredentialsDto,
  ): Promise<AuthUserDto | null> {
    return this.authService.verifyUserCredentials(verifyAuthUserCredentialsDto);
  }
}
