import { Module } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { MatchmakingResolver } from './matchmaking.resolver';
import { MatchModule } from 'src/match/match.module';

@Module({
  imports: [MatchModule],
  providers: [MatchmakingService, MatchmakingResolver],
})
export class MatchmakingModule {}
