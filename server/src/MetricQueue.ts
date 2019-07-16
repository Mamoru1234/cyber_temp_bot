import {Metric} from './Metric';
import { sortBy, dropWhile } from 'lodash';

export class MetricQueue {
  private _metrics: Metric[] = [];
  constructor(private _ttl: number) {}

  public add(metric: Metric) {
    const now = Date.now();
    const leftTime = now - this._ttl;
    if (metric.timestamp < leftTime) {
      return;
    }
    this._metrics.push(metric);
    this._metrics = sortBy(this._metrics, 'timestamp');
    this._metrics = dropWhile(this._metrics, (value) => value.timestamp < leftTime);
  }

  public getValues() {
    return this._metrics;
  }
}
