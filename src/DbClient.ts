import { MongoClient, Collection } from 'mongodb';
import {once} from 'lodash';
import {Metric} from './Metric';
const config = require('../config.json');

export const getClient = once(() => {
  const client = new MongoClient(config.db_url, {
    useNewUrlParser: true,
  });
  return client.connect();
});

export const getMetricsCollection = (client: MongoClient): Collection<Metric> => client.db('telemetry').collection('metrics');
