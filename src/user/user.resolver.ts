import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from 'src/graphql';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query('userById')
  matchById(@Args('id') id: string): Promise<User> {
    return this.userService.userById(id);
  }

  @Query('me')
  me(@Context() ctx): Promise<User> {
    return this.userService.me(ctx.token);
  }
}
