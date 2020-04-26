import { Module } from '@nestjs/common';
import { ChatResolver } from './chat.resolver';
import { ChatService } from './chat.service';
import { PubSub } from 'graphql-subscriptions';

@Module({
  providers: [
    ChatResolver,
    ChatService,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
})
export class ChatModule {}
