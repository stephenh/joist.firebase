
import { Model, ModelClass } from '@src/model';

import * as debug from 'debug';
export const log: debug.IDebugger = debug('ninjafire:schema');

export interface Property {
  name: string;
  get(instance: any): any;
  set(instance: any, value: any): void;
}

export class PrimitiveProperty implements Property {
  public name: string;

  constructor(name: string | symbol, type: string) {
    this.name = name.toString();
  }

  public get(instance: any): any {
    return null;
  }

  public set(instance: any, value: any): void {
  }
}

export class Schema {
  public properties: Property[] = [];

  public static getSchema<T>(proto: any): Schema {
    // calls like getShema(FooEntity) actually pass the constructor
    if (proto instanceof Function) {
      proto = proto.prototype;
    }
    if (proto.schema === undefined) {
      log('Creating a new schema for %o', proto);
      const schema = new Schema();
      Object.defineProperty(proto, 'schema', {
        configurable: false,
        enumerable: false,
        get: () => schema
      });
    }
    return proto.schema as Schema;
  }
}
