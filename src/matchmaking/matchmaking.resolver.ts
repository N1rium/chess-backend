import { Resolver, Subscription, Args, Mutation } from '@nestjs/graphql';
import { MatchmakingService } from './matchmaking.service';
import { PubSub } from 'graphql-subscriptions';
import { AuthGuard } from 'src/core/guards/auth';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/core/decorators/current-user';

const pubSub = new PubSub();

@Resolver('Matchmaking')
export class MatchmakingResolver {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  // @UseGuards(AuthGuard)
  // @Mutation(() => String, { name: 'matchmake' })
  // matchmake(@CurrentUser() user): Promise<string> {
  //   return this.matchmakingService.matchmake(user.id);
  // }

  @UseGuards(AuthGuard)
  @Mutation(() => String, { name: 'removeFromMatchmaking' })
  removeFromMatchmaking(@CurrentUser() user): string {
    return this.matchmakingService.removeUserFromQueue(user.id);
  }

  @Subscription(() => String, {
    filter: (payload, variables) =>
      variables.userIds.includes(payload.matchmake.userId),
  })
  matchmake(@Args('userId') userId: string) {
    return pubSub.asyncIterator('matchmake');
  }
}
