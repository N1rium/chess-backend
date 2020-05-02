import { Field, InputType } from '@nestjs/graphql';

/* ================================ Inputs ================================ */

@InputType()
export class MatchMoveInput {
  @Field(() => String)
  id: string;

  @Field(() => String)
  from: string;

  @Field(() => String)
  to: string;

  @Field(() => String)
  promotion: string;
}

@InputType()
export class CreateMatchInput {
  @Field(() => String, { nullable: true })
  side: string;

  @Field(() => Boolean, { defaultValue: false })
  rated: boolean;

  @Field(() => String, { nullable: true })
  opponent: string;

  @Field(() => Number, { defaultValue: 20 })
  timeControl: number;

  @Field(() => Number, { defaultValue: 0 })
  increment: number;
}
