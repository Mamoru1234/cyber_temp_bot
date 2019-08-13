import { describe, it, beforeEach, afterEach } from 'mocha';
import { MetricAnalyzer, MetricAnalyzerConfig } from './MetricAnalyzer';
import { Metric } from './Metric';
import { expect } from 'chai';
import { SinonSpy, spy, useFakeTimers, SinonFakeTimers } from 'sinon';

const createMetric = (temp: number): Metric => ({
  deviceId: '',
  humidity: 0,
  temp,
  timestamp: Date.now(),
});

const createConfig = (threshold: number): MetricAnalyzerConfig => ({
  maxNotifyHour: 8,
  minNotifyHour: 0,
  tempThreshold: threshold,
  queueDuration: 120000,
  minQueueSize: 5,
});

const HOURS = 1000 * 60 * 60;

const INITIAL_WORK_TIME = HOURS * 6 + HOURS * 24;

describe('MetricAnalyzer', () => {
  let timers: SinonFakeTimers = null as any;
  beforeEach(() => {
    timers = useFakeTimers(INITIAL_WORK_TIME);
  });
  afterEach(() => {
    timers.restore();
  });
  it('handle metric with get last', () => {
    const analyzer = new MetricAnalyzer(createConfig(29));
    const emitSpy: SinonSpy = spy(analyzer.events, 'emit');
    const metric = createMetric(23);
    analyzer.handleMetric(metric);
    expect(analyzer.getLastMetric()).to.be.eql(metric);
    expect(emitSpy.callCount).to.be.eql(0);
  });
  it('should not emit event if it not enough metrics', () => {
    const analyzer = new MetricAnalyzer(createConfig(20));
    const emitSpy: SinonSpy = spy(analyzer.events, 'emit');
    const metric = createMetric(23);
    analyzer.handleMetric(metric);
    analyzer.handleMetric(metric);
    analyzer.handleMetric(metric);
    analyzer.handleMetric(metric);
    expect(emitSpy.callCount).to.be.eql(0);
  });
  it('should emit event', () => {
    const analyzer = new MetricAnalyzer(createConfig(20));
    const emitSpy: SinonSpy = spy(analyzer.events, 'emit');
    analyzer.handleMetric(createMetric(23));
    timers.tick(500);
    analyzer.handleMetric(createMetric(23));
    timers.tick(4500);
    analyzer.handleMetric(createMetric(23));
    timers.tick(3500);
    analyzer.handleMetric(createMetric(23));
    timers.tick(15000);
    analyzer.handleMetric(createMetric(23));
    expect(emitSpy.callCount).to.be.eql(1);
  });
  it('should notify once per period', () => {
    const analyzer = new MetricAnalyzer(createConfig(20));
    const emitSpy: SinonSpy = spy(analyzer.events, 'emit');
    analyzer.handleMetric(createMetric(23));
    timers.tick(500);
    analyzer.handleMetric(createMetric(23));
    timers.tick(4500);
    analyzer.handleMetric(createMetric(23));
    timers.tick(3500);
    analyzer.handleMetric(createMetric(23));
    timers.tick(15000);
    analyzer.handleMetric(createMetric(23));
    expect(emitSpy.callCount).to.be.eql(1);
    analyzer.handleMetric(createMetric(23));
    timers.tick(3500);
    analyzer.handleMetric(createMetric(23));
    timers.tick(3500);
    analyzer.handleMetric(createMetric(23));
    expect(emitSpy.callCount).to.be.eql(1);
    timers.tick(HOURS * 22);
    analyzer.handleMetric(createMetric(23));
    timers.tick(500);
    analyzer.handleMetric(createMetric(23));
    timers.tick(4500);
    analyzer.handleMetric(createMetric(23));
    timers.tick(3500);
    analyzer.handleMetric(createMetric(23));
    timers.tick(15000);
    analyzer.handleMetric(createMetric(23));
    expect(emitSpy.callCount).to.be.eql(2);
  });
});
