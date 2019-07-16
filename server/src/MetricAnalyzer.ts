import {Metric} from './Metric';
import {BotWrapper} from './telegram/BotWrapper';
import {getClient, getMetricsCollection} from './DbClient';
import {sendToAllSubscribers} from './TemperatureBot';
import {MetricQueue} from './MetricQueue';
import { sumBy } from 'lodash';

const config = require('../config.json');

const NOTIFY_PERIOD = 1000 * 60 * 60 * 8;

export class MetricAnalyzer {
  private _lastNotification = 0;
  private _metrics = new MetricQueue(120000);

  constructor(private _bot: BotWrapper) {
  }

  private static async saveToDb(metric: Metric) {
    const client = await getClient();
    await getMetricsCollection(client).insertOne(metric);
  }

  private isAbnormal(): boolean {
    if (this._metrics.getValues().length === 0) {
      return false;
    }
    const averageTemp = sumBy(this._metrics.getValues(), 'temp') / this._metrics.getValues().length;
    return averageTemp > config.temp_threshold;
  }

  private notifyUsers() {
    if ((Date.now() - this._lastNotification) < NOTIFY_PERIOD) {
      return;
    }
    const averageTemp = sumBy(this._metrics.getValues(), 'temp') / this._metrics.getValues().length;
    sendToAllSubscribers(this._bot, `Адище в офисе: ${averageTemp.toFixed(2)}`);
    this._lastNotification = Date.now();
  }

  public async handleMetric(metric: Metric): Promise<void> {
    this._metrics.add(metric);
    if (this.isAbnormal()) {
      this.notifyUsers();
    }
    await MetricAnalyzer.saveToDb(metric);
  }
}
