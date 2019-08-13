import {Metric} from './Metric';
import {MetricQueue} from './MetricQueue';
import { sumBy, last } from 'lodash';
import EventEmitter = NodeJS.EventEmitter;

const config = require('../config.json');

const NOTIFY_PERIOD = 1000 * 60 * 60 * 8;

export interface AnomalyEvent {
  temp: number;
}

export class MetricAnalyzer {
  public static ANOMALY_EVENT = 'ANOMALY_EVENT';
  public events = new EventEmitter();

  private _lastNotification = 0;
  private _metrics = new MetricQueue(120000);

  constructor() {
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
    const event: AnomalyEvent = {
      temp: averageTemp,
    };
    this.events.emit(MetricAnalyzer.ANOMALY_EVENT, event);
    this._lastNotification = Date.now();
  }

  public getLastMetric(): Metric | undefined {
    return last(this._metrics.getValues());
  }

  public async handleMetric(metric: Metric): Promise<void> {
    this._metrics.add(metric);
    if (this.isAbnormal()) {
      this.notifyUsers();
    }
  }
}
