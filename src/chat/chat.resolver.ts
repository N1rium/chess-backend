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

const pubSub = new PubSub();

@Resolver('Chat')
export class ChatResolver {
  @Mutation(() => ChatMessage, { name: 'sendChatMessage' })
  @UseGuards(AuthGuard)
  async sendChatMessage(
    @Context() ctx,
    @Args('input', { type: () => ChatMessageInput }) input: ChatMessageInput,
  ): Promise<ChatMessage> {
    pubSub.publish('chatMessage', {
      chatMessage: {
        sender: ctx.token,
        content: input.message,
        room: input.room,
      },
    });
    console.log(input);
    return { sender: ctx.token, content: input.message };
  }

  @Subscription(() => ChatMessage, {
    filter: (payload, variables) => payload.chatMessage.room === variables.room,
  })
  chatMessage(@Args('room') room: string) {
    return pubSub.asyncIterator('chatMessage');
  }
}
