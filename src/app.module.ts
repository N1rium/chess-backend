import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MatchModule } from './match/match.module';
import { ChatModule } from './chat/chat.module';
import GraphQLModule from './graphql.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user/user.entity';
import { Match, MatchParticipant } from './match/match.entity';

@Module({
  imports: [
    UserModule,
    GraphQLModule,
    MatchModule,
    ChatModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'rogue.db.elephantsql.com',
      port: 5432,
      username: 'ueeqgkgm',
      password: 'I2qb1XAZYaRW0OUnoHpUaNiwbb9VOKuN',
      database: 'ueeqgkgm',
      entities: [User, Match, MatchParticipant],
      synchronize: true,
      autoLoadEntities: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
