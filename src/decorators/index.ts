
import { Log, log as parentLog } from '../';
export const log = parentLog.child('model');

export * from './property';
export * from './hasOne';
export * from './model';
