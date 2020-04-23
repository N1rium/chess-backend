import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { MatchService } from './match.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth';
import { PubSub } from 'graphql-subscriptions';
import { Match, MatchMoveInput, CreateMatchInput } from './match.entity';
import { CurrentUser } from 'src/core/decorators/current-user';

const pubSub = new PubSub();

@Resolver('Match')
export class MatchResolver {
  constructor(private readonly matchService: MatchService) {}

  @Query(() => Match, { name: 'matchById' })
  matchById(@Args('id', { type: () => String }) id: string): Promise<Match> {
    return this.matchService.matchById(id);
  }

  @UseGuards(AuthGuard)
  @Query(() => [Match], { name: 'availableMatches' })
  availableMatches(): Promise<Match[]> {
    return this.matchService.availableMatches();
  }

  @UseGuards(AuthGuard)
  @Query(() => [Match], { name: 'myMatches' })
  myMatches(@CurrentUser() user): Promise<Match[]> {
    return this.matchService.myMatches(user.id);
  }

  @UseGuards(AuthGuard)
  @Query(() => [Match], { name: 'myOngoingMatches' })
  myOngoingMatches(@CurrentUser() user): Promise<Match[]> {
    return this.matchService.userOngoingMatches(user.id);
  }

  @UseGuards(AuthGuard)
  @Query(() => [Match], { name: 'myFinishedMatches' })
  myFinishedMatches(@CurrentUser() user): Promise<Match[]> {
    return this.matchService.userFinishedMatches(user.id);
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

  @Mutation(() => Match, { name: 'matchMove' })
  @UseGuards(AuthGuard)
  async matchMove(
    @CurrentUser() user,
    @Args('input', { type: () => MatchMoveInput }) input: MatchMoveInput,
  ): Promise<Match> {
    const matchMoveMade = await this.matchService.matchMove(user.id, input);
    pubSub.publish('matchMoveMade', { matchMoveMade });
    return matchMoveMade;
  }

  @Subscription(() => Match, {
    filter: (payload, variables) => payload.matchMoveMade.id === variables.id,
  })
  matchMoveMade(@Args('id') id: string) {
    return pubSub.asyncIterator('matchMoveMade');
  }
}
