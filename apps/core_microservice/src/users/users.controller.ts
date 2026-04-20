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

import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a user' })
  @ApiCreatedResponse({
    description: 'User has been created successfully.',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'Request body validation failed.' })
  @Post()
  create(@Body() userDto: UserDto): Promise<UserDto> {
    return this.usersService.create(userDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'Users have been retrieved successfully.',
    type: UserDto,
    isArray: true,
  })
  findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiOkResponse({
    description: 'User has been retrieved successfully.',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'The provided user id is invalid.' })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiOkResponse({
    description: 'User has been updated successfully.',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'The provided user id or request body is invalid.' })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() userDto: UserDto): Promise<UserDto> {
    return this.usersService.update(id, userDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Fully update a user' })
  @ApiOkResponse({
    description: 'User has been updated successfully.',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'The provided user id or request body is invalid.' })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  put(@Param('id', ParseIntPipe) id: number, @Body() userDto: UserDto): Promise<UserDto> {
    return this.usersService.put(id, userDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiNoContentResponse({ description: 'User has been deleted successfully.' })
  @ApiBadRequestResponse({ description: 'The provided user id is invalid.' })
  @ApiNotFoundResponse({ description: 'User was not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}
