
import { Data, log, ModelMetadata, Store } from './';

export interface ModelClass<T> {
  modelName: string;
  new(store: Store, id?: string): T;
}

/** Base class for our model entities. */
export abstract class Model {

  public static modelName: string;
  public static modelPath: string;
  /** Allow a dynamic 'chroot' based on the group's prefix as set in the store. */
  public static pathPrefixGroup: string | undefined;

  public readonly id: string;
  public readonly metadata: ModelMetadata;

  constructor(store: Store, data: Data<Model>) {
    this.metadata = new ModelMetadata(store, this);
    this.id = data.id || store.newKey(this.metadata.fullModelsPath);
    log('Instantiated %s:%s', this.metadata.modelName, this.id);
  }

  public async save(): Promise<void> {
    await this.metadata.store._save(this);
  }

  public async unloadRecord(): Promise<void> {
    await this.metadata.store.unloadRecord(this);
  }
}
