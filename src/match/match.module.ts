import { Module } from '@nestjs/common';
import { MatchResolver } from './match.resolver';
import { MatchService } from './match.service';
import { Match, MatchParticipant } from './match.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Match, MatchParticipant])],
  providers: [MatchResolver, MatchService],
  exports: [MatchService],
})
export class MatchModule {}
