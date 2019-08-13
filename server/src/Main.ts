import { getBot } from './TemperatureBot';
// import { createApp } from './MetricsServer';
import { MetricAnalyzer } from './MetricAnalyzer';
import { createMqttCollector } from './MqttCollector';

const config = require('../config.json');

const metricsAnalyzer = new MetricAnalyzer();

getBot(config.bot_token, config.bot_auth_token, metricsAnalyzer);
// createApp(metricsAnalyzer);
createMqttCollector(metricsAnalyzer);
