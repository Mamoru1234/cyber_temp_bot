import {Metric} from './Metric';
import {BotWrapper} from './telegram/BotWrapper';
import {getClient, getMetricsCollection} from './DbClient';
import {sendToAllSubscribers} from './TemperatureBot';

const NOTIFY_PERIOD = 1000 * 60 * 60 * 8;

export class MetricAnalyzer {
  private _lastNotification = 0;

  constructor(private _bot: BotWrapper) {
  }

  public async handleMetric(metric: Metric): Promise<void> {
    const client = await getClient();
    await getMetricsCollection(client).insertOne(metric);
    console.log(metric);
    if (metric.temp > 26 && (Date.now() - this._lastNotification) > NOTIFY_PERIOD) {
      console.log('Send to subscribers');
      sendToAllSubscribers(this._bot, `Адище в офисе: ${metric.temp.toFixed(2)}`);
      this._lastNotification = Date.now();
    }
  }
}
