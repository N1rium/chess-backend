import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { FriendService } from './friend.service';
import { UseGuards } from '@nestjs/common';
import { Friend } from './friend.entity';
import { CurrentUser } from 'src/core/decorators/current-user';
import { AuthGuard } from 'src/core/guards/auth';

@Resolver('Friend')
export class FriendResolver {
  constructor(private readonly friendService: FriendService) {}

  @Query(() => [Friend], { name: 'myFriends' })
  myFriends(@CurrentUser() user): Promise<Friend[]> {
    return this.friendService.userFriends(user.id);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Friend, { name: 'friendRequest' })
  friendRequest(
    @CurrentUser() user,
    @Args('recipient', { type: () => String }) recipient: string,
  ): Promise<Friend> {
    return this.friendService.sendFriendRequest(user.id, recipient);
  }
}
