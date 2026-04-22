import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a user profile' })
  @ApiCreatedResponse({
    description: 'User profile has been created successfully.',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'Request body validation failed.' })
  @Post()
  create(@Body() userDto: UserDto): Promise<UserDto> {
    return this.usersService.create(userDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user profiles' })
  @ApiOkResponse({
    description: 'User profiles have been retrieved successfully.',
    type: UserDto,
    isArray: true,
  })
  findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user profile by id' })
  @ApiOkResponse({
    description: 'User profile has been retrieved successfully.',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'The provided user id is invalid.' })
  @ApiNotFoundResponse({ description: 'User profile was not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user profile' })
  @ApiOkResponse({
    description: 'User profile has been updated successfully.',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'The provided user id or request body is invalid.' })
  @ApiNotFoundResponse({ description: 'User profile was not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Fully update a user profile' })
  @ApiOkResponse({
    description: 'User profile has been updated successfully.',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'The provided user id or request body is invalid.' })
  @ApiNotFoundResponse({ description: 'User profile was not found.' })
  put(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.put(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user profile' })
  @ApiNoContentResponse({ description: 'User profile has been deleted successfully.' })
  @ApiBadRequestResponse({ description: 'The provided user id is invalid.' })
  @ApiNotFoundResponse({ description: 'User profile was not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
