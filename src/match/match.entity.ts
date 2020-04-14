import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
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

  @Field(() => [User])
  @ManyToMany(type => User, { eager: true })
  @JoinTable()
  participants: User[];
}

@ObjectType()
@Entity()
export class MatchMove {
  @PrimaryGeneratedColumn('increment')
  id: number;

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
  @CreateDateColumn({ type: 'timestamp' })
  date: Date;

  @ManyToOne(
    type => Match,
    match => match.moves,
  )
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
