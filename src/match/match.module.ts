import { Module } from '@nestjs/common';
import { MatchResolver } from './match.resolver';
import { MatchService } from './match.service';
import { Match, MatchMove, MatchParticipant } from './match.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Match, MatchMove, MatchParticipant])],
  providers: [MatchResolver, MatchService],
})
export class MatchModule {}
