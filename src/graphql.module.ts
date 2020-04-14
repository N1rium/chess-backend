import { GraphQLModule } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { join } from 'path';

export default GraphQLModule.forRoot({
  // typePaths: ['./**/*.graphql'],
  autoSchemaFile: 'src/schema.gql',
  installSubscriptionHandlers: true,
  context: async ({ req }: any) => {
    const ctx = {
      ...(req?.headers?.token && { token: req.headers.token }),
    };
    return ctx;
  },
  // resolvers: { JSON: GraphQLJSON },
});
