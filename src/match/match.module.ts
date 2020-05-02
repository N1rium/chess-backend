import { Module } from '@nestjs/common';
import { MatchResolver } from './match.resolver';
import { MatchService } from './match.service';
import { Match, MatchParticipant } from './match.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { User } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match, MatchParticipant, User])],
  providers: [
    MatchResolver,
    MatchService,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  exports: [MatchService],
})
export class MatchModule {}
