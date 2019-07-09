import {Schema} from 'jsonschema';

export interface Metric {
  deviceId: string;
  timestamp: number;
  temp: number;
  humidity: number;
}

export interface Sample {
  deviceId: string;
  temp: number;
  humidity: number;
}

const numberSchema = {
  type: 'number',
};

export const sampleSchema: Schema = {
  type: 'object',
  properties: {
    deviceId: {
      type: 'string',
    },
    temp: numberSchema,
    humidity: numberSchema,
  },
  additionalProperties: false,
};
