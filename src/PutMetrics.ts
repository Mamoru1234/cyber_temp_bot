import fetch from 'node-fetch';
import {Metric} from './Metric';
const config = require('../config.json');

const SERVER_URL = 'http://localhost:4567';

function getMetricOption(metric: Metric): any {
  return {
    method: 'PUT',
    body: JSON.stringify({
      token: config.server_auth_token,
      payload: metric,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
}

async function main() {
  const targetUrl = SERVER_URL + '/sample';
  const metrics: Metric[] = [
    {
      timestamp: Date.now() - 100,
      humidity: 124,
      temp: 2,
    },
    {
      timestamp: Date.now() - 50,
      humidity: 124,
      temp: 2,
    },
    {
      timestamp: Date.now(),
      humidity: 124,
      temp: 2,
    }
  ];
  for (const metric of metrics) {
    await fetch(targetUrl, getMetricOption(metric));
  }
}

main().catch((err) => {
  console.error(err);
});
