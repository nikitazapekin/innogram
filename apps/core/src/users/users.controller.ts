import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
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

import { Public, AuthenticatedRequest } from '@innogram/shared';
import { PostDto } from '../posts/dto/post.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @ApiOperation({ summary: 'Create a profile' })
  @ApiCreatedResponse({
    description: 'Profile has been created successfully.',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'Request body validation failed.' })
  @Post()
  create(@Body() userDto: UpdateUserDto): Promise<UserDto> {
    return this.usersService.create(userDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all profiles' })
  @ApiOkResponse({
    description: 'Profiles have been retrieved successfully.',
    type: UserDto,
    isArray: true,
  })
  findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiOkResponse({
    description: 'Profile has been retrieved successfully.',
    type: UserDto,
  })
  @ApiNotFoundResponse({ description: 'Profile was not found.' })
  getProfile(@Req() request: AuthenticatedRequest): Promise<UserDto> {
    return this.usersService.findByEmail(request.user!.email);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a profile by id' })
  @ApiOkResponse({
    description: 'Profile has been retrieved successfully.',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'The provided profile id is invalid.' })
  @ApiNotFoundResponse({ description: 'Profile was not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.usersService.findOne(id);
  }

  @Public()
  @Get(':id/posts')
  @ApiOperation({ summary: 'Get posts by profile id' })
  @ApiOkResponse({
    description: 'Posts have been retrieved successfully.',
    type: PostDto,
    isArray: true,
  })
  getPostsByProfileId(@Param('id', ParseIntPipe) id: number): Promise<PostDto[]> {
    return this.usersService.getPostsByProfileId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a profile' })
  @ApiOkResponse({
    description: 'Profile has been updated successfully.',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'The provided profile id or request body is invalid.' })
  @ApiNotFoundResponse({ description: 'Profile was not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Fully update a profile' })
  @ApiOkResponse({
    description: 'Profile has been updated successfully.',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'The provided profile id or request body is invalid.' })
  @ApiNotFoundResponse({ description: 'Profile was not found.' })
  put(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.put(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a profile' })
  @ApiNoContentResponse({ description: 'Profile has been deleted successfully.' })
  @ApiBadRequestResponse({ description: 'The provided profile id is invalid.' })
  @ApiNotFoundResponse({ description: 'Profile was not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}
