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

import { User } from './user/user.entity';
import { Match, MatchParticipant } from './match/match.entity';
import { Friend } from './friend/friend.entity';

@Module({
  imports: [
    UserModule,
    GraphQLModule,
    MatchModule,
    MatchInviteModule,
    ChatModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'rogue.db.elephantsql.com',
      port: 5432,
      username: 'ueeqgkgm',
      password: 'I2qb1XAZYaRW0OUnoHpUaNiwbb9VOKuN',
      database: 'ueeqgkgm',
      entities: [User, Match, MatchParticipant, Friend],
      synchronize: true,
      autoLoadEntities: true,
    }),
    FriendModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
