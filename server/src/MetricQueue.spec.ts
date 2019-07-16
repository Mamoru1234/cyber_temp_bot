import { describe, it } from 'mocha';
import {MetricQueue} from './MetricQueue';
import {Metric} from './Metric';
import { expect } from 'chai';
import {uniqueId} from 'lodash';
import { useFakeTimers } from 'sinon';

const generateMetric = (diff: number): Metric => ({
  timestamp: Date.now() + diff,
  deviceId: uniqueId(),
  humidity: 12,
  temp: 45,
});

describe('MetricsQueue', () => {
  it('should add metric', () => {
    const queue = new MetricQueue(1000);
    const metric = generateMetric(0);
    queue.add(metric);
    expect(queue.getValues()).to.be.eqls([metric]);
  });
  it('should skip old metric', () => {
    const queue = new MetricQueue(1000);
    const metric = generateMetric(-2000);
    queue.add(metric);
    expect(queue.getValues()).to.be.eqls([]);
  });
  it('should order metrics by time', () => {
    const queue = new MetricQueue(1000);
    const metrics = [
      generateMetric(-300),
      generateMetric(-700),
      generateMetric(-500),
    ];
    metrics.forEach((metric) => {
      queue.add(metric);
    });
    expect(queue.getValues()).to.be.eqls([metrics[1], metrics[2], metrics[0]]);
  });
  it('should skip metrics after ttl', () => {
    const clock = useFakeTimers();
    clock.tick(2000);
    const queue = new MetricQueue(1000);
    const metrics = [
      generateMetric(-300),
      generateMetric(-700),
      generateMetric(-500),
    ];
    metrics.forEach((metric) => {
      queue.add(metric);
    });
    expect(queue.getValues()).to.be.eqls([metrics[1], metrics[2], metrics[0]]);
    clock.tick(600);
    const newMetric = generateMetric(-200);
    queue.add(newMetric);
    expect(queue.getValues()).to.be.eqls([metrics[0], newMetric]);
    clock.restore();
  });
});
