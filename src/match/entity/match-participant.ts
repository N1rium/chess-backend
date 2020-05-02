import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Match } from './match.entity';

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
