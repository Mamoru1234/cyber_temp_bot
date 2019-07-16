import { MongoClient, Collection } from 'mongodb';
import {once} from 'lodash';
import {Metric} from './Metric';
import {createClient} from 'redis';
const config = require('../config.json');

export const getClient = once(() => {
  const client = new MongoClient(config.db_url, {
    useNewUrlParser: true,
  });
  return client.connect();
});

export const getRedisClient = () => {
  return createClient({
    host: config.redis_host,
    port: config.redis_port,
    retry_strategy: () => 1000,
  });
};

export const getMetricsCollection = (client: MongoClient): Collection<Metric> => client.db('telemetry').collection('metrics');
// mongoexport --db telemetry --collection metrics --type=csv -f deviceId,timestamp,temp,humidity -o metrics.csv
