import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ObjectType,
  Field,
  ID,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';

import { User } from 'src/user/user.entity';

export enum MatchType {
  CLASSICAL = 'CLASSICAL',
  RAPID = 'RAPID',
  BLITZ = 'BLITZ',
  BULLET = 'BULLET',
}

registerEnumType(MatchType, {
  name: 'MatchType',
});

/* ================================ Match ================================ */

@ObjectType()
@Entity()
export class Match {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => MatchType)
  @Column({ type: 'enum', enum: MatchType, default: MatchType.CLASSICAL })
  type: MatchType;

  @Field(() => Boolean)
  @Column({ type: 'bool', default: 'false' })
  realtime: boolean;

  @Field(() => String)
  @Column({ type: 'varchar', length: 1 })
  turn: string;

  @Field(() => String)
  @Column({ type: 'varchar' })
  fen: string;

  @Field(() => String)
  @Column({ type: 'varchar' })
  pgn: string;

  @Field(() => Boolean)
  @Column({ type: 'bool', default: 'false' })
  rated: boolean;

  @Field(() => Boolean)
  @Column({ type: 'bool' })
  gameOver: boolean;

  @Field(() => Boolean)
  @Column({ type: 'bool' })
  draw: boolean;

  @Field(() => Boolean)
  @Column({ type: 'bool' })
  checkmate: boolean;

  @Field(() => Boolean)
  @Column({ type: 'bool' })
  stalemate: boolean;

  @Field(() => Boolean)
  @Column({ type: 'bool' })
  threefold: boolean;

  @Column({ type: 'integer' })
  timeControl: number;

  @Column({ type: 'integer' })
  increment: number;

  @Field(() => [MatchParticipant], { nullable: true })
  @OneToMany(
    type => MatchParticipant,
    participant => participant.match,
    { eager: true },
  )
  participants: MatchParticipant[];

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;
}

/* ======================== Match Participant ================================ */

@ObjectType()
@Entity()
export class MatchParticipant {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Field(() => User)
  @ManyToOne(type => User, { eager: true })
  user: User;

  @Field(() => Number)
  @Column({ type: 'integer', default: 0 })
  eloChange: number;

  @Column({ type: 'boolean', default: false })
  @Field(() => Boolean)
  winner: boolean;

  @Column({ type: 'varchar', length: 1 })
  @Field(() => String)
  side: string;

  @Field(() => Number)
  @Column({ type: 'bigint' })
  pendingTimeoutDate: number;

  @Field(() => Number)
  @Column({ type: 'bigint' })
  time: number;

  @ManyToOne(type => Match)
  match: Match;
}

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

  @Field(() => String, { nullable: true })
  opponent: string;

  @Field(() => Number, { defaultValue: 20 })
  timeControl: number;

  @Field(() => Number, { defaultValue: 0 })
  increment: number;
}
