import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType()
export class ChatMessage {
  @Field(() => String)
  sender;

  @Field(() => String)
  content;
}

@InputType()
export class ChatMessageInput {
  @Field(() => String)
  message;

  @Field(() => String)
  room;
}
