
import { Model, ModelPromise } from '@src/model';
import { Log, log as parentLog } from '../';
export const log: Log = parentLog.child('schema');

export { Property } from './Property';
export { PrimitiveProperty } from './PrimitiveProperty';
export { Schema } from './Schema';

// Constants that can be used to satisfy "field must be initialized", but
// we'll ignore in the property setters. Seems cute but hacky.
export const defaultValue = {
  s: 'SPECIAL STRING VALUE',
  n: Number.EPSILON,
  mp: <T extends Model>(): ModelPromise<T> => {
    return {} as any as ModelPromise<T>;
  }
};
