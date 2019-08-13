import {Metric} from './Metric';
import {MetricQueue} from './MetricQueue';
import { sumBy, last } from 'lodash';
import { EventEmitter } from 'events';

export interface AnomalyEvent {
  temp: number;
}

export interface MetricAnalyzerConfig {
  tempThreshold: number;
  minNotifyHour: number;
  maxNotifyHour: number;
  minQueueSize: number;
  queueDuration: number;
}

export class MetricAnalyzer {
  public static ANOMALY_EVENT = 'ANOMALY_EVENT';
  public readonly events = new EventEmitter();

  private _lastNotification = 0;
  private readonly _metrics: MetricQueue;
  private readonly _period: number;

  constructor(
    private readonly _config: MetricAnalyzerConfig
  ) {
    this._metrics = new MetricQueue(_config.queueDuration);
    this._period = (_config.maxNotifyHour - _config.minNotifyHour) * 1000 * 60 * 60;
  }

  private isAbnormal(): boolean {
    if (this._metrics.getValues().length < this._config.minQueueSize) {
      return false;
    }
    const averageTemp = sumBy(this._metrics.getValues(), 'temp') / this._metrics.getValues().length;
    return averageTemp > this._config.tempThreshold;
  }

  private notifyUsers() {
    const curTime = new Date();
    if ((curTime.getTime() - this._lastNotification) < this._period) {
      return;
    }
    const utcHours = curTime.getUTCHours();
    if (utcHours < this._config.minNotifyHour || utcHours > this._config.maxNotifyHour) {
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
