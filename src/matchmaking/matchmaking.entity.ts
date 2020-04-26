import { ObjectType, Field } from '@nestjs/graphql';

export class MatchmakingParticipant {
  id?: string;
  elo?: number;
  constructor(id) {
    this.id = id;
  }
}

export enum MatchmakingSearchMode {
  ANY = 'any',
}

@ObjectType()
export class MatchmakingResponse {
  @Field(() => String)
  matchId;

  @Field(() => [String])
  userIds;
}
