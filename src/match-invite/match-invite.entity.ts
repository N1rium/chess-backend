import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';

@ObjectType()
export class MatchInvite {
  @Field(() => String)
  id: string;

  @Field(() => User)
  creator: User;

  @Field(() => User, { nullable: true })
  invited: User;

  @Field(() => String)
  createdDate: string;

  constructor() {
    this.id = this.createdDate = Date.now().toString();
  }
}

@ObjectType()
export class MatchInviteSubData {
  @Field(() => MatchInvite)
  invite: MatchInvite;

  @Field(() => Boolean, { defaultValue: false })
  deleted: boolean;
}
