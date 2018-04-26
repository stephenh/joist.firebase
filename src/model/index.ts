
import * as debug from 'debug';
export const log: debug.IDebugger = debug('ninjafire:model');

export { Data } from './Data';
export { Model, ModelClass } from './Model';
export { ModelMetadata } from './ModelMetadata';
export { ModelPromise } from './ModelPromise';
export { Store } from '../store';

