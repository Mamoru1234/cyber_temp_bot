import { MongoClient, Collection } from 'mongodb';
import {once} from 'lodash';

export const getClient = once(() => {
  const client = new MongoClient('mongodb://localhost:27017', {
    useNewUrlParser: true,
  });
  return client.connect();
});

export const getMetricsCollection = (client: MongoClient): Collection => client.db('telemetry').collection('metrics');
