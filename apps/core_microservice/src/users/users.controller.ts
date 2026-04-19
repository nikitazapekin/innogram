import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { PutUserDto } from './dto/put-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ type: CreateUserDto })
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
    description: 'User identifier.',
    type: 'integer',
  })
  @ApiOkResponse({
    description: 'User has been retrieved successfully.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'The provided user id is invalid.' })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  findOne(@Param('id') id: number): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({
    name: 'id',
    description: 'User identifier.',
    type: 'integer',
  })
  @ApiBody({ type: PutUserDto })
  @ApiOkResponse({
    description: 'User has been updated successfully.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'The provided user id or request body is invalid.' })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Fully update a user' })
  @ApiBody({ type: PutUserDto })
  @ApiParam({
    name: 'id',
    description: 'User identifier.',
    type: 'integer',
  })
  @ApiOkResponse({
    description: 'User has been updated successfully.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'The provided user id or request body is invalid.' })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  put(@Param('id') id: number, @Body() putUserDto: PutUserDto): Promise<UserResponseDto> {
    return this.usersService.put(id, putUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({
    name: 'id',
    description: 'User identifier.',
    type: 'integer',
  })
  @ApiNoContentResponse({ description: 'User has been deleted successfully.' })
  @ApiBadRequestResponse({ description: 'The provided user id is invalid.' })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}
