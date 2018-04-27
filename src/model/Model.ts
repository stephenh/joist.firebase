
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

  public readonly id: string;
  // data would be a nicer/shorter name but more likely to collide with entity fields
  public readonly instanceData: InstanceData;

  constructor(store: Store, data: Data<Model>) {
    this.instanceData = new InstanceData(store, this);
    this.id = data.id || store.newKey(this.instanceData.fullModelsPath);
    Object.assign(this, data);
    log('Instantiated %s', this);
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
