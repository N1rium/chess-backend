import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    try {
      return jwt.verify(ctx.getContext().token, 'secret');
    } catch (e) {
      throw new UnauthorizedException({ message: 'invalid token' });
    }
  },
);
