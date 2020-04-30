import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { Friend } from 'src/friend/friend.entity';

export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  ANON = 'anon',
}

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Field(() => String)
  @Column('varchar', { length: 50 })
  username: string;

  @Column('varchar', { length: 50, unique: true })
  email: string;

  @Column('varchar', { length: 50 })
  password: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedDate: Date;

  @ManyToMany(type => Friend)
  @JoinTable()
  friends: Friend[];

  @Field(() => Number)
  @Column({ type: 'integer', default: 1500 })
  classicalElo: number;

  @Field(() => Number)
  @Column({ type: 'integer', default: 1500 })
  rapidElo: number;

  @Field(() => Number)
  @Column({ type: 'integer', default: 1500 })
  blitzElo: number;

  @Field(() => Number)
  @Column({ type: 'integer', default: 1500 })
  bulletElo: number;

  // @Column({
  //   type: 'enum',
  //   enum: UserRole,
  //   default: UserRole.ANON,
  // })
  // role: UserRole;
}

@InputType()
export class LoginInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}

@ObjectType()
export class LoginResponse {
  @Field(() => User)
  user: User;

  @Field(() => String)
  token: string;
}

@InputType()
export class CreateUserInput {
  @Field(() => String)
  username: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  passwordRepeat: string;
}
