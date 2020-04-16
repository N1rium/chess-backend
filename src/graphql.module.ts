import { GraphQLModule } from '@nestjs/graphql';

export default GraphQLModule.forRoot({
  autoSchemaFile: 'src/schema.gql',
  installSubscriptionHandlers: true,
  context: async ({ req }: any) => {
    const ctx = {
      ...(req?.headers?.token && { token: req.headers.token }),
    };
    return ctx;
  },
});
