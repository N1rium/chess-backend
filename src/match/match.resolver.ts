import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  Subscription,
} from '@nestjs/graphql';
import { MatchService } from './match.service';
import { Match, CreateMatchInput, MatchMoveInput } from 'src/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Resolver('Match')
export class MatchResolver {
  constructor(private readonly matchService: MatchService) {}

  @Query('matchById')
  matchById(@Args('id') id: string): Promise<Match> {
    return this.matchService.matchById(id);
  }

  @Mutation('createMatch')
  updateUser(@Args('input') input: CreateMatchInput): Promise<Match> {
    return this.matchService.createMatch(input);
  }

  @Mutation('matchMove')
  @UseGuards(AuthGuard)
  async matchMove(
    @Context() ctx,
    @Args('input') input: MatchMoveInput,
  ): Promise<Match> {
    const matchMoveMade = await this.matchService.matchMove(ctx.token, input);
    pubSub.publish('matchMoveMade', { matchMoveMade });
    return matchMoveMade;
  }

  @Subscription('matchMoveMade', {
    filter: (payload, variables) => payload.matchMoveMade.id === variables.id,
  })
  matchMoveMade() {
    return pubSub.asyncIterator('matchMoveMade');
  }
}
