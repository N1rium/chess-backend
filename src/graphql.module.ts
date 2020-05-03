import { GraphQLModule } from '@nestjs/graphql';

export default GraphQLModule.forRoot({
  autoSchemaFile: 'tmp/schema.gql',
  installSubscriptionHandlers: true,
  playground:true,
  introspection: true,
  context: async ({ req }: any) => {
    const ctx = {
      ...(req?.headers?.token && { token: req.headers.token }),
    };
    return ctx;
  },
});
