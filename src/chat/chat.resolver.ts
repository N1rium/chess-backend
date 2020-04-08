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
import { ChatMessageInput, ChatMessage } from 'src/graphql';

const pubSub = new PubSub();

@Resolver('Chat')
export class ChatResolver {
  @Mutation('sendChatMessage')
  @UseGuards(AuthGuard)
  async matchMove(
    @Context() ctx,
    @Args('input') input: ChatMessageInput,
  ): Promise<ChatMessage> {
    pubSub.publish('chatMessage', {
      chatMessage: {
        sender: ctx.token,
        content: input.message,
        room: input.room,
      },
    });
    return { sender: ctx.token, content: input.message };
  }

  @Subscription('chatMessage', {
    filter: (payload, variables) => payload.chatMessage.room === variables.room,
  })
  chatMessage() {
    return pubSub.asyncIterator('chatMessage');
  }
}
