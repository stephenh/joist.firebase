
import { Schema } from '@src/schema';
import { log as parentLog } from './';

const log = parentLog.child('model');

export interface ModelOptions {
  name?: string;
  path: string;
}

/** Decorator that stores model-level information on the schema. */
export function model(options: ModelOptions): ClassDecorator {
  return <T extends Function>(constructor: T) => {
    const schema = Schema.getSchema(constructor);
    schema.modelName = options.name || options.path;
    schema.modelPath = options.path;
    // Define the static ModelClass.modelName for the user
    Object.defineProperty(constructor, 'modelName', {
      enumerable: false,
      get: () => {
        return schema.modelName;
      }
    });
  };
}
