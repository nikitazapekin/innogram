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

import { Public } from '@innogram/shared';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Public()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Get(':id/following')
  @ApiOperation({ summary: 'Get profiles followed by profile id' })
  @ApiOkResponse({
    description: 'Followed profiles have been retrieved successfully.',
  })
  @ApiBadRequestResponse({ description: 'The provided profile id is invalid.' })
  @ApiNotFoundResponse({ description: 'Profile was not found.' })
  findFollowing(@Param('id', ParseIntPipe) id: number): Promise<UserDto[]> {
    return this.usersService.findFollowingProfiles(id);
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

  @Post(':id/following/:targetId')
  @ApiOperation({ summary: 'Follow a profile' })
  @ApiCreatedResponse({ description: 'Follow relation has been created successfully.' })
  @ApiBadRequestResponse({
    description: 'The provided profile ids are invalid or the profile tries to follow itself.',
  })
  @ApiNotFoundResponse({ description: 'Follower or target profile was not found.' })
  follow(
    @Param('id', ParseIntPipe) id: number,
    @Param('targetId', ParseIntPipe) targetId: number,
  ): Promise<void> {
    return this.usersService.followProfile(id, targetId);
  }

  @Delete(':id/following/:targetId')
  @ApiOperation({ summary: 'Unfollow a profile' })
  @ApiNoContentResponse({ description: 'Follow relation has been removed successfully.' })
  @ApiBadRequestResponse({
    description: 'The provided profile ids are invalid or the profile tries to unfollow itself.',
  })
  @ApiNotFoundResponse({ description: 'Follower or target profile was not found.' })
  unfollow(
    @Param('id', ParseIntPipe) id: number,
    @Param('targetId', ParseIntPipe) targetId: number,
  ): Promise<void> {
    return this.usersService.unfollowProfile(id, targetId);
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
