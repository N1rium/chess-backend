import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { MatchService } from './match.service';
import { UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth';
import { PubSubEngine } from 'graphql-subscriptions';
import { CurrentUser } from 'src/core/decorators/current-user';
import { CreateMatchInput, MatchMoveInput } from './match.entity';
import { Match } from './entity/match.entity';

@Resolver('Match')
export class MatchResolver {
  constructor(
    private readonly matchService: MatchService,
    @Inject('PUB_SUB') private pubSub: PubSubEngine,
  ) {}

  @Query(() => Match, { name: 'matchById' })
  matchById(@Args('id', { type: () => String }) id: string): Promise<Match> {
    return this.matchService.matchById(id);
  }

  @Query(() => Boolean, { name: 'cleanup' })
  cleanup(): Promise<boolean> {
    return this.matchService.cleanup();
  }

  @UseGuards(AuthGuard)
  @Query(() => [Match], { name: 'myMatches' })
  myMatches(@CurrentUser() user): Promise<Match[]> {
    return this.matchService.myMatches(user.id);
  }

  @UseGuards(AuthGuard)
  @Query(() => [Match], { name: 'myOngoingMatches' })
  myOngoingMatches(@CurrentUser() user): Promise<Match[]> {
    return this.matchService.userOngoingMatches(user.id, true);
  }

  @UseGuards(AuthGuard)
  @Query(() => [Match], { name: 'myFinishedMatches' })
  myFinishedMatches(@CurrentUser() user): Promise<Match[]> {
    return this.matchService.userFinishedMatches(user.id, true);
  }

  @UseGuards(AuthGuard)
  @Query(() => [Match], { name: 'finishedMatches' })
  finishedMatches(
    @Args('id', { type: () => String }) userId,
  ): Promise<Match[]> {
    return this.matchService.userFinishedMatches(userId, false);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Match, { name: 'createMatch' })
  createMatch(
    @CurrentUser() user,
    @Args('input', { type: () => CreateMatchInput }) input: CreateMatchInput,
  ): Promise<Match> {
    return this.matchService.createMatch(user.id, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Match, { name: 'joinMatch' })
  joinMatch(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user,
  ): Promise<Match> {
    return this.matchService.joinMatch(id, user.id);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Match, { name: 'forfeit' })
  forfeit(
    @Args('matchId', { type: () => String }) matchId: string,
    @CurrentUser() user,
  ): Promise<Match> {
    return this.matchService.forfeit(matchId, user.id);
  }

  @Mutation(() => Match, { name: 'matchMove' })
  @UseGuards(AuthGuard)
  async matchMove(
    @CurrentUser() user,
    @Args('input', { type: () => MatchMoveInput }) input: MatchMoveInput,
  ): Promise<Match> {
    const matchMoveMade = await this.matchService.matchMove(user.id, input);
    return matchMoveMade;
  }

  @Subscription(() => Match, {
    filter: (payload, variables) => payload.matchMoveMade.id === variables.id,
  })
  matchMoveMade(@Args('id') id: string) {
    return this.pubSub.asyncIterator('matchMoveMade');
  }
}
