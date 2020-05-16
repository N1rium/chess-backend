import { Module } from '@nestjs/common';
import { MatchResolver } from './match.resolver';
import { MatchService } from './match.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { User } from 'src/user/user.entity';
import { Match } from './entity/match.entity';
import { MatchParticipant } from './entity/match-participant';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    TypeOrmModule.forFeature([Match, MatchParticipant, User]),
  ],
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
