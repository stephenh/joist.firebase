
import { Model, ModelClass, ModelPromise } from '@src/model';
import { defaultValue, Property } from '@src/schema';
import { log } from './';

export class BelongsToProperty implements Property {
  public name: string;
  private readonly parentClass: ModelClass<any>;

  constructor(name: string | symbol, type: string, parentClass: ModelClass<any>) {
    this.name = name.toString();
    this.parentClass = parentClass;
  }

  public get(instance: Model): any {
    const id = instance.instanceData.get(this.name);
    const store = instance.instanceData.store;
    return store.findRecord(this.parentClass, id);
  }

  public set(instance: Model, value: any): void {
    // We use {} as the default value
    if (Object.keys(value).length === 0) {
      return;
    }
    // Resolve the ModelPromise/Model down to just an id
    if (value instanceof ModelPromise) {
      instance.instanceData.set(this.name, value.id);
    } else if (value instanceof Model) {
      instance.instanceData.set(this.name, value.id);
    } else {
      throw new Error(`Unexpected belongs to value: ${value}`);
    }
  }
}
