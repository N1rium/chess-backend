import {
  Resolver,
  Mutation,
  Context,
  Args,
  Subscription,
} from '@nestjs/graphql';

import { PubSub } from 'graphql-subscriptions';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth';
import { ChatMessage, ChatMessageInput } from './chat.entity';
import { CurrentUser } from 'src/core/decorators/current-user';

const pubSub = new PubSub();

@Resolver('Chat')
export class ChatResolver {
  @Mutation(() => ChatMessage, { name: 'sendChatMessage' })
  @UseGuards(AuthGuard)
  async sendChatMessage(
    @CurrentUser() user,
    @Args('input', { type: () => ChatMessageInput }) input: ChatMessageInput,
  ): Promise<ChatMessage> {
    pubSub.publish('chatMessage', {
      chatMessage: {
        sender: user.username,
        content: input.message,
        room: input.room,
      },
    });
    return { sender: user.username, content: input.message };
  }

  @Subscription(() => ChatMessage, {
    filter: (payload, variables) => payload.chatMessage.room === variables.room,
  })
  chatMessage(@Args('room') room: string) {
    return pubSub.asyncIterator('chatMessage');
  }
}
