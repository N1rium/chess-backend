import { Resolver, Mutation, Args, Subscription } from '@nestjs/graphql';

import { PubSubEngine } from 'graphql-subscriptions';
import { UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth';
import { ChatMessage, ChatMessageInput } from './chat.entity';
import { CurrentUser } from 'src/core/decorators/current-user';

@Resolver('Chat')
export class ChatResolver {
  constructor(@Inject('PUB_SUB') private pubSub: PubSubEngine) {}

  @Mutation(() => ChatMessage, { name: 'sendChatMessage' })
  @UseGuards(AuthGuard)
  async sendChatMessage(
    @CurrentUser() user,
    @Args('input', { type: () => ChatMessageInput }) input: ChatMessageInput,
  ): Promise<ChatMessage> {
    this.pubSub.publish('chatMessage', {
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
    console.log('sub');
    return this.pubSub.asyncIterator('chatMessage');
  }
}
