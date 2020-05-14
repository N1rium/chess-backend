import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from 'src/user/user.entity';
import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

export enum Relationship {
  PENDING = 'PENDING',
  MUTUAL = 'MUTUAL',
  BLOCKED = 'BLOCKED',
}

registerEnumType(Relationship, {
  name: 'Relationship',
});

@Entity()
@ObjectType()
export class Friend {
  @Field(() => User)
  @ManyToOne(
    type => User,
    user => user.id,
    { primary: true },
  )
  user: User;

  @Field(() => User)
  @ManyToOne(
    type => User,
    user => user.id,
    { primary: true },
  )
  friend: User;

  @Field(() => Relationship)
  @Column({ type: 'enum', enum: Relationship, default: Relationship.MUTUAL })
  status: Relationship;
}
