import { Module } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { MatchmakingResolver } from './matchmaking.resolver';
import { MatchModule } from 'src/match/match.module';
import { PubSub } from 'graphql-subscriptions';

@Module({
  imports: [MatchModule],
  providers: [
    MatchmakingService,
    MatchmakingResolver,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
})
export class MatchmakingModule {}
