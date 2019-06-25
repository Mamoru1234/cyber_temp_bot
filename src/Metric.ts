import {Schema} from 'jsonschema';

export interface Metric {
  timestamp: number;
  temp: number;
  humidity: number;
}

const numberSchema = {
  type: 'number',
};

export const metricSchema: Schema = {
  type: 'object',
  properties: {
    timestamp: numberSchema,
    temp: numberSchema,
    humidity: numberSchema,
  },
  additionalProperties: false,
};
