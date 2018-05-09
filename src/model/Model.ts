
import { Data, InstanceData, log, Store } from './';

export interface ModelClass<T> {
  modelName: string;
  new(store: Store, data: Data<T>): T;
}

/** Base class for our model entities. */
export abstract class Model {

  // Defined automatically by the @model decorator
  public static modelName: string;

  // data would be a nicer/shorter name but more likely to collide with entity fields
  public readonly instanceData: InstanceData<this>;

  constructor(store: Store, data: Data<Model>) {
    this.instanceData = new InstanceData<this>(store, this, data as Data<this>);
    // InstanceData will have pulled out id already, so remove it as it's not writeable
    const copy = { ...data };
    delete copy.id;
    // These copies will still go through our setters and end up in instanceData.localAttributes
    Object.assign(this, copy);
    log('Instantiated %s', this);
  }

  public get id(): string {
    return this.instanceData.id;
  }

  public async save(): Promise<void> {
    await this.instanceData.store._save(this);
  }

  public async unloadRecord(): Promise<void> {
    await this.instanceData.store.unloadRecord(this);
  }

  public toString(): string {
    return `${this.instanceData.modelName}#${this.id}`;
  }
}
