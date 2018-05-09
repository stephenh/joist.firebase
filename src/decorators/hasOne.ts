
import { ModelClass } from '@src/model';
import { Schema } from '@src/schema';
import { HasOneProperty } from '@src/schema/HasOneProperty';
import { log as parentLog, property } from './';

const log = parentLog.child('hasOne');

export interface HasOneOptions {
  inverse?: string;
}

/** Accepts/returns a model (or model promise) and store it as the key. */
export function hasOne(parentClass: ModelClass<any>, options?: HasOneOptions): PropertyDecorator {
  return (proto: Object, name: string | symbol) => {
    const prop = new HasOneProperty(name, parentClass, options || {});
    Schema.getSchema(proto).properties.push(prop);
    log('Defining %s on %o', prop, proto);
    Object.defineProperty(proto, name, {
      get: function (): any {
        // tslint:disable-next-line:no-invalid-this
        return prop.get(this as any);
      },
      set: function (value: any): any {
        // tslint:disable-next-line:no-invalid-this
        prop.set(this as any, value);
      }
    });
  };
}
