import { getBot } from './TemperatureBot';
// import { createApp } from './MetricsServer';
import { MetricAnalyzer, MetricAnalyzerConfig } from './MetricAnalyzer';
import { createMqttCollector, MqttCollectorConfig } from './MqttCollector';

const config = require('../config.json');

const metricAnalyzerConfig: MetricAnalyzerConfig = {
  tempThreshold: config.analyzer.tempThreshold,
  minNotifyHour: config.analyzer.minNotifyHour,
  maxNotifyHour: config.analyzer.maxNotifyHour,
  minQueueSize: config.analyzer.minQueueSize,
  queueDuration: config.analyzer.queueDuration,
};

const metricsAnalyzer = new MetricAnalyzer(metricAnalyzerConfig);

getBot(config.bot_token, config.bot_auth_token, metricsAnalyzer);
// createApp(metricsAnalyzer);

const mqttCollectorConfig: MqttCollectorConfig = {
  authToken: config.server_auth_token,
  dataTopic: config.mqtt_data_topic,
  url: config.mqtt_url,
};

createMqttCollector(mqttCollectorConfig, metricsAnalyzer);
