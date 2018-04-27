
import * as debug from 'debug';

export interface Log {
  (formatter: any, ...args: any[]): void;

  child(name: string): Log;
}

// tslint:disable-next-line:no-unnecessary-class
export class Log {
  public static create(namespace: string): Log {
    const log = debug(namespace);
    const fn = (formatter: any, ...args: any[]): void => {
      log(formatter, ...args);
    };
    // tslint:disable-next-line:prefer-object-spread
    return Object.assign(fn, { child: (name: string) => Log.create(`${namespace}:${name}`) });
  }
}
