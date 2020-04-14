import { Module } from '@nestjs/common';
import { MatchResolver } from './match.resolver';
import { MatchService } from './match.service';
import { Match, MatchMove } from './match.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Match, MatchMove])],
  providers: [MatchResolver, MatchService],
})
export class MatchModule {}
