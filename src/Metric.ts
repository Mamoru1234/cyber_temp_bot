import {Schema} from 'jsonschema';

export interface Metric {
  timestamp: number;
  temp: number;
  humidity: number;
}

export interface Sample {
  temp: number;
  humidity: number;
}

const numberSchema = {
  type: 'number',
};

export const sampleSchema: Schema = {
  type: 'object',
  properties: {
    timestamp: numberSchema,
    temp: numberSchema,
    humidity: numberSchema,
  },
  additionalProperties: false,
};
