import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne } from 'typeorm';
import { User } from 'src/user/user.entity';

export enum Relationship {
  PENDING = 'pending',
  MUTUAL = 'mutual',
}

@Entity()
export class Friend {
  @ManyToOne(
    type => User,
    user => user.id,
    { primary: true },
  )
  user: User;

  @ManyToOne(
    type => User,
    user => user.id,
    { primary: true },
  )
  friend: User;

  @Column({ type: 'enum', enum: Relationship, default: Relationship.MUTUAL })
  status: Relationship;
}
