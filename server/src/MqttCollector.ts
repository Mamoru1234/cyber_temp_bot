import mqtt from 'mqtt';
import {MetricAnalyzer} from './MetricAnalyzer';
import {Metric} from './Metric';
const config = require('../config.json');

export const createMqttCollector = (metricAnalyzer: MetricAnalyzer) => {
  const client = mqtt.connect(config.mqtt_url);

  client.on('connect', () => {
    client.subscribe(config.mqtt_data_topic, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
  client.on('message', async (topic: string, message: Buffer) => {
    if (topic !== config.mqtt_data_topic) {
      return;
    }
    const json: any = JSON.parse(message.toString());
    if (json.token !== config.server_auth_token) {
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
  });
};
