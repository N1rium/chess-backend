import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MatchParticipant } from './match-participant';

export enum MatchType {
  CLASSICAL = 'CLASSICAL',
  RAPID = 'RAPID',
  BLITZ = 'BLITZ',
  BULLET = 'BULLET',
}

registerEnumType(MatchType, {
  name: 'MatchType',
});

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

  @Field(() => Boolean)
  @Column({ type: 'bool', default: 'false' })
  timedout: boolean;

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

  @Field(() => MatchParticipant, { nullable: true })
  self: MatchParticipant;

  @Field(() => MatchParticipant, { nullable: true })
  opponent: MatchParticipant;

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;
}
