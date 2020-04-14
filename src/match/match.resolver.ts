import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  Subscription,
} from '@nestjs/graphql';
import { MatchService } from './match.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth';
import { PubSub } from 'graphql-subscriptions';
import { Match, MatchMove, MatchMoveInput } from './match.entity';

const pubSub = new PubSub();

@Resolver('Match')
export class MatchResolver {
  constructor(private readonly matchService: MatchService) {}

  @Query(() => Match, { name: 'matchById' })
  matchById(@Args('id', { type: () => String }) id: string): Promise<Match> {
    return this.matchService.matchById(id);
  }

  @Mutation(() => Match, { name: 'createMatch' })
  @UseGuards(AuthGuard)
  createMatch(): Promise<Match> {
    return this.matchService.createMatch();
  }

  @Mutation(() => Match, { name: 'joinMatch' })
  joinMatch(@Args('id', { type: () => String }) id: string): Promise<Match> {
    return this.matchService.joinMatch(id);
  }

  @Mutation(() => Match, { name: 'matchMove' })
  @UseGuards(AuthGuard)
  async matchMove(
    @Context() ctx,
    @Args('input', { type: () => MatchMoveInput }) input: MatchMoveInput,
  ): Promise<Match> {
    const matchMoveMade = await this.matchService.matchMove(ctx.token, input);
    pubSub.publish('matchMoveMade', { matchMoveMade });
    return matchMoveMade;
  }

  @Subscription(() => MatchMove, {
    filter: (payload, variables) => payload.matchMoveMade.id === variables.id,
  })
  matchMoveMade(@Args('id') id: string) {
    return pubSub.asyncIterator('matchMoveMade');
  }
}
