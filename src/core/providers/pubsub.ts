import { PubSub } from 'graphql-subscriptions';

export default {
  provide: 'PUB_SUB',
  useValue: new PubSub(),
};
