
import { Data, InstanceData, log, Store } from './';

export interface ModelClass<T> {
  modelName: string;
  new(store: Store, data: Data<T>): T;
}

/** Base class for our model entities. */
export abstract class Model {

  public static modelName: string;
  public static modelPath: string;
  /** Allow a dynamic 'chroot' based on the group's prefix as set in the store. */
  public static pathPrefixGroup: string | undefined;

  // data would be a nicer/shorter name but more likely to collide with entity fields
  public readonly instanceData: InstanceData;

  constructor(store: Store, data: Data<Model>) {
    this.instanceData = new InstanceData(store, this);
    const copy = { ...data };
    // InstanceData will have pulled out id already, so remove it as it's not writeable
    delete copy.id;
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
