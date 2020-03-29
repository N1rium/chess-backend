import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { MatchService } from './match.service';
import { Match, CreateMatchInput, MatchMoveInput } from 'src/graphql';

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
  matchMove(@Args('input') input: MatchMoveInput): Promise<Match> {
    return this.matchService.matchMove(input);
  }
}
