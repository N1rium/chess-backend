import { Resolver, Subscription, Args, Mutation } from '@nestjs/graphql';
import { MatchmakingService } from './matchmaking.service';
import { PubSubEngine } from 'graphql-subscriptions';
import { AuthGuard } from 'src/core/guards/auth';
import { UseGuards, Inject } from '@nestjs/common';
import { CurrentUser } from 'src/core/decorators/current-user';
import { MatchmakingResponse } from './matchmaking.entity';

@Resolver('Matchmaking')
export class MatchmakingResolver {
  constructor(
    private readonly matchmakingService: MatchmakingService,
    @Inject('PUB_SUB') private pubSub: PubSubEngine,
  ) {}

  @UseGuards(AuthGuard)
  @Mutation(() => String, { name: 'addToMatchmaking' })
  addToMatchmaking(@CurrentUser() user): Promise<string> {
    return this.matchmakingService.addUserToQueue(user.id);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => String, { name: 'removeFromMatchmaking' })
  removeFromMatchmaking(@CurrentUser() user): Promise<string> {
    return this.matchmakingService.removeUserFromQueue(user.id);
  }

  @Subscription(() => MatchmakingResponse, {
    filter: (payload, variables) => {
      return payload.matchmake.userIds.includes(variables.userId);
    },
  })
  matchmake(@Args('userId') userId: string) {
    return this.pubSub.asyncIterator('matchmake');
  }
}
