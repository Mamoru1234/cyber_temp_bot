import express from 'express';
import {getClient, getMetricsCollection} from './DbClient';
import {Schema, validate} from 'jsonschema';
import {Metric, metricSchema} from './Metric';

const config = require('../config.json');

const app = express();

app.use(express.json());

interface Message {
  token: string;
  payload: any;
}

const messageSchema: Schema = {
  type: 'object',
  properties: {
    token: {
      type: 'string',
    },
    payload: {
      type: 'object',
    },
  },
  additionalProperties: false,
};

function validatePayload(payload: any, schema: Schema, res: express.Response) {
  const validatorResult = validate(payload, schema);
  if (validatorResult.errors.length !== 0) {
    res.status(400).send(validatorResult.errors);
    return false;
  }
  return true;
}

app.put('/sample', async (req, res) => {
  const client = await getClient();
  if (!validatePayload(req.body, messageSchema, res)) {
    return;
  }
  const message: Message = req.body;
  if (!validatePayload(message.payload, metricSchema, res)) {
    return;
  }
  if (message.token !== config.server_auth_token) {
    res.status(401).send('Unauthorized');
    return;
  }
  const metric: Metric = message.payload;
  await getMetricsCollection(client).insertOne(metric);
  res.send('');
});

app.listen(4567, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Listen');
});
