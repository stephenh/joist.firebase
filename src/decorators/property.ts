
import { ModelClass } from '@src/model';
import { PrimitiveProperty, Schema } from '@src/schema';
import 'reflect-metadata';
import { log as parentLog } from './';

const log = parentLog.child('property');

/** Accepts/returns primitive values, e.g strings, numbers, etc. */
export function property(): PropertyDecorator {
  return (proto: Object, name: string | symbol) => {
    const type: string = Reflect.getMetadata('design:type', proto, name).name;
    const prop = new PrimitiveProperty(name, type);
    Schema.getSchema(proto).properties.push(prop);
    log('Defining %o on %o', prop, proto);
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
