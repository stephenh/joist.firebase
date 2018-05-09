
import { Model, ModelClass } from '@src/model';
import { log as parentLog, Property } from '@src/schema';

const log = parentLog.child('schema');

export class Schema {

  public modelName?: string;
  public modelPath?: string;
  public properties: Property[] = [];

  public static getSchemaForInstance(instance: Model): Schema {
    return this.getSchema(Object.getPrototypeOf(instance));
  }

  public static getSchema(proto: any): Schema {
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
