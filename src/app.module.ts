import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MatchModule } from './match/match.module';
import { MatchInviteModule } from './match-invite/match-invite.module';
import { ChatModule } from './chat/chat.module';
import { FriendModule } from './friend/friend.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import GraphQLModule from './graphql.module';
import { ScheduleModule } from '@nestjs/schedule';

import { User } from './user/user.entity';
import { Match, MatchParticipant } from './match/match.entity';
import { Friend } from './friend/friend.entity';
import { MatchmakingModule } from './matchmaking/matchmaking.module';

import { PubSub } from 'graphql-subscriptions';

@Module({
  imports: [
    UserModule,
    GraphQLModule,
    MatchModule,
    MatchInviteModule,
    ChatModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'ec2-54-228-250-82.eu-west-1.compute.amazonaws.com',
      port: 5432,
      username: 'gjorzqxkgxxjzo',
      password:
        '8c23b97ce3fe993cb827ca24934433d823e18d471acc8fefdf3810e4d99d4c31',
      database: 'dctcaf773e0nqt',
      extra: { ssl: { rejectUnauthorized: false } },
      entities: [User, Match, MatchParticipant, Friend],
      synchronize: true,
      autoLoadEntities: true,
    }),
    FriendModule,
    MatchmakingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
