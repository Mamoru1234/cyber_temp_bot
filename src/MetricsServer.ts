import express from 'express';
import {getClient, getMetricsCollection} from './DbClient';
import {Schema, validate} from 'jsonschema';
import {Sample, sampleSchema} from './Metric';
import {getBot, sendToAllSubscribers} from './TemperatureBot';

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

const bot = getBot(config.bot_token, config.bot_auth_token);
const TEMP_ERROR = 4;
let lastnotificationTime = 0;
const NOTIFY_PERIOD = 1000 * 60 * 60 * 12;

app.put('/sample', async (req, res) => {
  const client = await getClient();
  if (!validatePayload(req.body, messageSchema, res)) {
    return;
  }
  const message: Message = req.body;
  if (!validatePayload(message.payload, sampleSchema, res)) {
    return;
  }
  if (message.token !== config.server_auth_token) {
    res.status(401).send('Unauthorized');
    return;
  }
  const sample: Sample = message.payload;
  sample.temp = sample.temp - TEMP_ERROR;
  if (sample.temp > 30 && (lastnotificationTime - Date.now()) > NOTIFY_PERIOD) {
    sendToAllSubscribers(bot, `Адище в офисе: ${sample.temp.toFixed(2)}`);
    lastnotificationTime = Date.now();
  }
  await getMetricsCollection(client).insertOne({
    ...sample,
    timestamp: Date.now(),
  });
  res.send('');
});

app.listen(4567, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Listen');
});
