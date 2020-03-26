import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

export default GraphQLModule.forRoot({
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
  },
});
