import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
// import { CreateUserInput } from 'src/graphql';
import {
  User,
  LoginInput,
  LoginResponse,
  CreateUserInput,
} from './user.entity';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(_returns => User, { name: 'userById' })
  userById(@Args('id') id: string): Promise<User> {
    return this.userService.userById(id);
  }

  @Query(_returns => User, { name: 'userByEmail' })
  userByEmail(@Args('email') email: string): Promise<User> {
    return this.userService.userByEmail(email);
  }

  @Query(_returns => User, { name: 'me' })
  me(@Context() ctx): Promise<User> {
    return this.userService.me(ctx.token);
  }

  @Query(_returns => LoginResponse, { name: 'login' })
  login(
    @Args('input', { type: () => LoginInput }) input: LoginInput,
  ): Promise<LoginResponse> {
    return this.userService.login(input);
  }

  @Mutation(_returns => LoginResponse)
  createUser(
    @Args('input', { type: () => CreateUserInput }) input: CreateUserInput,
  ): Promise<LoginResponse> {
    return this.userService.createUser(input);
  }
}
