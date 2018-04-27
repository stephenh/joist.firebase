
import { Model, ModelClass } from '@src/model';
import { log, Property } from '@src/schema';

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