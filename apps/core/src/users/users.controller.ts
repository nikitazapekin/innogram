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
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Public, AuthenticatedRequest } from '@innogram/shared';
import { FollowRequestDto } from './dto/follow-request.dto';
import { RelationshipDto } from './dto/relationship.dto';
import { RespondFollowRequestDto } from './dto/respond-follow-request.dto';
import { SubscribeProfileDto } from './dto/subscribe-profile.dto';
import { PostDto } from '../posts/dto/post.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
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
  findAll(@Query('searchTerm') searchTerm?: string): Promise<UserDto[]> {
    if (searchTerm) {
      return this.usersService.search(searchTerm);
    }

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

  @Get('me')
  @ApiOperation({ summary: 'Get the current user profile (alias for /profile)' })
  @ApiOkResponse({
    description: 'Profile has been retrieved successfully.',
    type: UserDto,
  })
  @ApiNotFoundResponse({ description: 'Profile was not found.' })
  getMe(@Req() request: AuthenticatedRequest): Promise<UserDto> {
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

  @Get(':id/relationship')
  @ApiOperation({ summary: 'Get relationship between current user and profile' })
  @ApiOkResponse({
    description: 'Relationship status has been retrieved successfully.',
    type: RelationshipDto,
  })
  getRelationship(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<RelationshipDto> {
    return this.usersService.getRelationship(request.user!.email, id);
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

  @Get(':id/followers')
  @ApiOperation({ summary: 'Get followers of profile id' })
  @ApiOkResponse({
    description: 'Followers have been retrieved successfully.',
  })
  @ApiBadRequestResponse({ description: 'The provided profile id is invalid.' })
  @ApiNotFoundResponse({ description: 'Profile was not found.' })
  findFollowers(@Param('id', ParseIntPipe) id: number): Promise<UserDto[]> {
    return this.usersService.findFollowers(id);
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

  @Patch('profile')
  @ApiOperation({ summary: 'Update the current user profile' })
  @ApiOkResponse({
    description: 'Profile has been updated successfully.',
    type: UserDto,
  })
  @ApiBadRequestResponse({ description: 'Request body validation failed.' })
  @ApiNotFoundResponse({ description: 'Profile was not found.' })
  updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.updateProfile(request.user!.email, updateUserDto);
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

  @Post(':id/subscribe')
  @ApiOperation({ summary: 'Subscribe to a profile (alias for follow)' })
  @ApiCreatedResponse({ description: 'Subscription or follow request has been created.' })
  @ApiNoContentResponse({ description: 'Subscription has been created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid subscription request.' })
  @ApiNotFoundResponse({ description: 'Profile was not found.' })
  subscribe(
    @Param('id', ParseIntPipe) followingProfileId: number,
    @Body() body: SubscribeProfileDto,
  ): Promise<FollowRequestDto | void> {
    return this.usersService.followProfile(body.followerProfileId, followingProfileId);
  }

  @Post(':id/following/:targetId')
  @ApiOperation({ summary: 'Follow a profile (creates follow request if private)' })
  @ApiCreatedResponse({
    description: 'Follow relation has been created successfully.',
  })
  @ApiBadRequestResponse({
    description: 'The provided profile ids are invalid or the profile tries to follow itself.',
  })
  @ApiNotFoundResponse({ description: 'Follower or target profile was not found.' })
  follow(
    @Param('id', ParseIntPipe) id: number,
    @Param('targetId', ParseIntPipe) targetId: number,
  ): Promise<FollowRequestDto | void> {
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

  @Get(':id/follow-requests/pending')
  @ApiOperation({ summary: 'Get pending follow requests for a profile' })
  @ApiOkResponse({
    description: 'Pending follow requests have been retrieved successfully.',
    type: FollowRequestDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Profile was not found.' })
  getPendingFollowRequests(@Param('id', ParseIntPipe) id: number): Promise<FollowRequestDto[]> {
    return this.usersService.getPendingFollowRequests(id);
  }

  @Post(':id/follow-requests/:requestId/respond')
  @ApiOperation({ summary: 'Approve or reject a follow request' })
  @ApiOkResponse({
    description: 'Follow request has been processed successfully.',
    type: FollowRequestDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid request or already processed.' })
  @ApiNotFoundResponse({ description: 'Follow request was not found.' })
  respondToFollowRequest(
    @Param('id', ParseIntPipe) id: number,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() dto: RespondFollowRequestDto,
  ): Promise<FollowRequestDto> {
    return this.usersService.respondToFollowRequest(requestId, id, dto.status);
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
