
import { HasOneOptions } from '@src/decorators';
import { Model, ModelClass, ModelPromise } from '@src/model';
import { Property } from '@src/schema';
import { log } from './';

/**
 * A marker value to short-circuit inverse recursion
 *
 * E.g. if A.b = B, which should percolated to B.a = A, we don't
 * want to again recurse back to A.b = B, as we'd infinite loop.
 */
export class PercolatedId {
  public readonly id: string;
  constructor(id: string) {
    this.id = id;
  }
}

export class HasOneProperty implements Property {
  public name: string;
  private readonly parentClass: ModelClass<any>;
  private readonly options: HasOneOptions;

  constructor(name: string | symbol, parentClass: ModelClass<any>, options: HasOneOptions) {
    this.name = name.toString();
    this.parentClass = parentClass;
    this.options = options;
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
    let id: string;
    let shouldPercolate = true;
    if (value instanceof ModelPromise) {
      id = value.id;
    } else if (value instanceof Model) {
      id = value.id;
    } else if (value instanceof PercolatedId) {
      id = value.id;
      shouldPercolate = false;
    } else {
      throw new Error(`Unexpected belongs to value: ${value}`);
    }
    instance.instanceData.set(this.name, id);
    const inverse = this.options.inverse;
    if (inverse && shouldPercolate) {
      // In theory since we were given the model or model promise, we shouldn't
      // have to do this store lookup.
      const mp = instance.instanceData.store.findRecord(this.parentClass, id);
      if (mp.instance) {
        log('Setting inverse %s.%s to %s', mp.instance, inverse, instance.id);
        mp.instance[inverse] = new PercolatedId(instance.id);
      } else {
        throw new Error('This codepath is not tested yet');
        // log('Promising to set inverse %s.%s to %s', mp, inverse, instance.id);
        // mp.then(other => other[inverse] = new PercolatedId(instance.id));
      }
    }
  }

  public toString(): string {
    return `hasOne(${this.name})`;
  }
}
