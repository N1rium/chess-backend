import { GraphQLModule } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { join } from 'path';

export default GraphQLModule.forRoot({
  typePaths: ['./**/*.graphql'],
  installSubscriptionHandlers: true,
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
  },
  context: async ({ req, connection }: any) => {
    const ctx = {
      ...(req?.headers?.token && { token: req.headers.token }),
    };
    return ctx;
  },
  resolvers: { JSON: GraphQLJSON },
});
