import mqtt from 'mqtt';
import {MetricAnalyzer} from './MetricAnalyzer';
import {Metric} from './Metric';
import { getClient, getMetricsCollection } from './DbClient';

async function saveToDb(metric: Metric) {
  const client = await getClient();
  await getMetricsCollection(client).insertOne(metric);
}

export interface MqttCollectorConfig {
  url: string;
  dataTopic: string;
  authToken: string;
}

export const createMqttCollector = (config: MqttCollectorConfig, metricAnalyzer: MetricAnalyzer) => {
  const client = mqtt.connect(config.url);

  client.on('connect', () => {
    client.subscribe(config.dataTopic, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
  client.on('message', async (topic: string, message: Buffer) => {
    if (topic !== config.dataTopic) {
      return;
    }
    const json: any = JSON.parse(message.toString());
    if (json.token !== config.authToken) {
      console.log('Unauthorized message received');
      return;
    }
    const metric: Metric = {
      deviceId: json.mac,
      temp: json.temperature,
      humidity: json.humidity,
      timestamp: Date.now(),
    };
    await metricAnalyzer.handleMetric(metric);
    await saveToDb(metric);
  });
};
