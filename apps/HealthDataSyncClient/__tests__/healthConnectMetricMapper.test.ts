import { healthConnectMetricMapper } from '../src/lib/services/healthConnect/healthConnectMetricMapper';

describe('healthConnectMetricMapper', () => {
  it('maps record types that were previously missing from the switch', () => {
    const results = [
      ...healthConnectMetricMapper.mapRecord('CervicalMucus', {
        recordType: 'CervicalMucus',
        appearance: 2,
        time: '2024-01-01T09:00:00.000Z',
      } as any),
      ...healthConnectMetricMapper.mapRecord('ExerciseSession', {
        recordType: 'ExerciseSession',
        startTime: '2024-01-01T09:00:00.000Z',
        endTime: '2024-01-01T09:25:00.000Z',
        exerciseType: 1,
      } as any),
      ...healthConnectMetricMapper.mapRecord('IntermenstrualBleeding', {
        recordType: 'IntermenstrualBleeding',
        time: '2024-01-01T09:00:00.000Z',
      } as any),
      ...healthConnectMetricMapper.mapRecord('MenstruationPeriod', {
        recordType: 'MenstruationPeriod',
        time: '2024-01-01T09:00:00.000Z',
      } as any),
      ...healthConnectMetricMapper.mapRecord('MindfulnessSession', {
        recordType: 'MindfulnessSession',
        startTime: '2024-01-01T09:00:00.000Z',
        endTime: '2024-01-01T09:45:00.000Z',
        mindfulnessSessionType: 1,
      } as any),
      ...healthConnectMetricMapper.mapRecord('SexualActivity', {
        recordType: 'SexualActivity',
        time: '2024-01-01T09:00:00.000Z',
        protectionUsed: 1,
      } as any),
      ...healthConnectMetricMapper.mapRecord('SleepSession', {
        recordType: 'SleepSession',
        startTime: '2024-01-01T21:00:00.000Z',
        endTime: '2024-01-02T06:00:00.000Z',
      } as any),
    ];

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          metricName: 'CervicalMucus',
          value: 2,
          unit: 'code',
        }),
        expect.objectContaining({
          metricName: 'ExerciseSession',
          value: 25,
          unit: 'min',
        }),
        expect.objectContaining({
          metricName: 'IntermenstrualBleeding',
          value: 1,
          unit: 'code',
        }),
        expect.objectContaining({
          metricName: 'MenstruationPeriod',
          value: 1,
          unit: 'code',
        }),
        expect.objectContaining({
          metricName: 'MindfulnessSession',
          value: 45,
          unit: 'min',
        }),
        expect.objectContaining({
          metricName: 'SexualActivity',
          value: 1,
          unit: 'code',
        }),
        expect.objectContaining({
          metricName: 'SleepSession',
          value: 540,
          unit: 'min',
        }),
      ]),
    );
  });
});
