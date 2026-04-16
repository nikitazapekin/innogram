import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a user' })
  @ApiCreatedResponse({
    description: 'User has been created successfully.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Request body validation failed.' })
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'Users have been retrieved successfully.',
    type: UserResponseDto,
    isArray: true,
  })
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({
    name: 'id',
    description: 'Numeric user identifier.',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'User has been retrieved successfully.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'The provided user id is not a valid integer.' })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({
    name: 'id',
    description: 'Numeric user identifier.',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'User has been updated successfully.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'The provided user id or request body is invalid.' })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({
    name: 'id',
    description: 'Numeric user identifier.',
    type: Number,
    example: 1,
  })
  @ApiNoContentResponse({ description: 'User has been deleted successfully.' })
  @ApiBadRequestResponse({ description: 'The provided user id is not a valid integer.' })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}
