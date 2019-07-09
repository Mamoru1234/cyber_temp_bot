import {getBot} from './TemperatureBot';
import {createApp} from './MetricsServer';
import {MetricAnalyzer} from './MetricAnalyzer';
import {createMqttCollector} from './MqttCollector';
const config = require('../config.json');

const bot = getBot(config.bot_token, config.bot_auth_token);
const metricsAnalyzer = new MetricAnalyzer(bot);

createApp(metricsAnalyzer);
createMqttCollector(metricsAnalyzer);
