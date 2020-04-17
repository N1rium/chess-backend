import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  PrimaryColumn,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

import { User } from 'src/user/user.entity';

@ObjectType()
@Entity()
export class Match {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 1 })
  turn: string;

  @Field(() => String)
  @Column({ type: 'varchar' })
  fen: string;

  @Field(() => String)
  @Column({ type: 'varchar' })
  pgn: string;

  @Field(() => [String])
  @Column({ type: 'varchar', array: true })
  captured: string[];

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

  @Field(() => [MatchMove], { nullable: true })
  @OneToMany(
    type => MatchMove,
    move => move.match,
    { eager: true },
  )
  moves: MatchMove[];

  @Field(() => [MatchParticipant], { nullable: true })
  @OneToMany(
    type => MatchParticipant,
    participant => participant.match,
    { eager: true },
  )
  participants: MatchParticipant[];
}

@ObjectType()
@Entity()
export class MatchMove {
  @Field(() => String)
  @Column({ type: 'varchar', length: 10 })
  from: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 10 })
  to: string;

  @Field(() => String)
  @Column({ type: 'varchar' })
  fen: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 10 })
  san: string;

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamp', primary: true })
  date: Date;

  @ManyToOne(type => Match)
  match: Match;

  @Field(() => User)
  @ManyToOne(type => User, { eager: true })
  user: User;
}

@ObjectType()
@Entity()
export class MatchParticipant {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Field(() => User)
  @ManyToOne(type => User, { eager: true })
  user: User;

  @Column({ type: 'varchar', length: 1 })
  @Field(() => String)
  side: string;

  @ManyToOne(type => Match)
  match: Match;
}

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
