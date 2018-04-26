
import * as debug from 'debug';
import * as firebase from 'firebase';
import { Reference } from './firebase';
import { Store } from './store';

const log: debug.IDebugger = debug('ninjafire:model');

/**
 * The promises returned by the model contain an extra 'id' attribute that is available prior to the promise being resolved.
 * This enables records to be added and removed from relationships without having to retrieve the record first
 */
export class ModelPromise<T extends Model> extends Promise<T> {
  public readonly id: string;
  public readonly modelName: string;
  public get instance(): T | undefined { return this._instance; }
  private _instance?: T;

  constructor(id: string, modelName: string, executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
    super(executor);
    this.id = id;
    this.modelName = modelName;
    this.then(i => this._instance = i);
  }
}

export interface ModelClass<T> {
  modelName: string;
  new(store: Store, id?: string): T;
}

export abstract class Model {

  public static modelName: string;
  public static modelPath: string;
  public static embedded: boolean = false; // The model is for embedding within another
  /**
   * A model can return a pathPrefixGroup to 'chroot' the record under a specific location
   * this will be inserted between the basePath configured in the store and the generated path from this.modelName
   * It is intended to be used to group records by team etc.
   *
   * The path for the group needs to be registered with the store
   */
  public static pathPrefixGroup: string | null = null;

  public id: string;
  public isNew: boolean = false;
  public isDeleted: boolean = false;

  public get hasDirtyAttributes(): boolean {
    return Object.keys(this._localAttributes).length !== 0 || this.isNew || this.isDeleted;
  }

  /**
   * The reason the record is dirty
   * 'created' if the record is new
   * 'updated' if the record has been updated
   * 'deleted' if the record has been deleted but not yet committed
   */
  public get dirtyType(): string | null {
    return this.isDeleted ? 'deleted' : this.isNew ? 'created' : this.hasDirtyAttributes ? 'updated' : null;
  }

  /**
   * Returns the path to the record in firebase
   * Intended for use internally within `ninjafire` only
   *
   * The path to the record is the concatenation of
   * The base path in the store
   * Any specific path required for this PathPrefixGroup
   * The plural name for the model
   * The id for the record
   */
  public get _path(): string {
    let path: string = this.store.basePath;
    if (this.pathPrefixGroup !== null) {
      const pathPrefix = this.store.pathPrefix[this.pathPrefixGroup];
      if (pathPrefix === null || pathPrefix === undefined) {
        throw Error(`Path prefix ${this.pathPrefixGroup} is not configured in the store`);
      }
      path += pathPrefix;
    }
    path += `/${this.modelPath}/${this.id}`;
    return path;
  }

  public _ref?: Reference;
  public store: Store;
  public _remoteAttributes: { [key: string]: any; } = {}; // The state of the object in Firebase (as last seen)
  public _localAttributes: { [key: string]: any; } = {}; // Any local attribute changes that have not yet been submitted
  public _atomicallyLinked: Model[] = []; // Other records that will be saved when this record is saved
  public _embeddedRecords: { [attribute: string]: { [id: string]: Model } } = {}; // Any embedded records that have been accessed via their hasMany or belongsTo relationship - This is used to track future updates
  public _embeddedIn: Model | null = null; // The record this embedded record is attached to

  constructor(store: Store, id?: string) {
    this.store = store;
    if (id) {
      this.id = id;
    } else {
      this.id = this.store.newKey(this._path);
    }
  }

  /**
   * Saves the record by informing the store, or the record this record is embedded in that it needs to be saved
   */
  public async save(): Promise<void> {
    if (this._embeddedIn !== null && this._embeddedIn !== undefined) {
      await this._embeddedIn.save();
    } else if (this.embedded === true) {
      throw Error('record can only be saved when embedded');
    } else {
      await this.store._save(this);
    }

  }

  public _pathsToSave(parentPath?: string): { [key: string]: number | string | null } {
    return {};
  }


  /**
   * Returns an object whose keys are changed attributes and value is an [oldProp, newProp] array
   * This array represents a diff of the canonical state with the local state of the model.
   * Note: If the model is created locally the canonical state is empty since there is no remote record
   */
  public changedAttributes(): { [key: string]: [{}, {}] } {
    const changedAttributes: { [key: string]: [{}, {}] } = {};
    Object.keys(this._localAttributes).map((key: string) => {
      changedAttributes[key] = [this._remoteAttributes[key], this._localAttributes[key]];
    });
    return changedAttributes;
  }

  /**
   * Unloads the record from the store. This will cause the record to be destroyed and freed up for garbage collection.
   */
  public async unloadRecord(): Promise<void> {
    await this.store.unloadRecord(this);
  }

  /**
   * Set the attributes for the model from an object
   * All attributes must be passed. Any local changes will not be affected
   * @param object Any object describing the keys and values for the model
   */
  public setAttributesFrom(object: { [key: string]: any }): void {
    this._remoteAttributes = {};
  }

  public _willUnload(): void {
    if (this._ref !== undefined && this._ref !== null) {
      log(`removing ref for ${this.id}`);
      this._ref.off();
      this._ref = undefined;
    }
  }

  public async rawFirebaseValue(attribute: string): Promise<any> {
    const snapshot = await this.store.database.ref(this._path).once('value');
    const val = snapshot.val();
    return val[attribute];
  }

  /** Record completed saving. Called by the store. */
  public async _didSave(): Promise<void> {
    // Ensure this record is linked to firebase
    await this.store._linkToFirebase(this);
    this.isNew = false;
    // Clear local attributes as change has been saved
    this._localAttributes = {};
  }

  public get modelName(): string {
    return (this.constructor as typeof Model).modelName;
  }

  public get modelPath(): string {
    return (this.constructor as typeof Model).modelPath;
  }

  public get embedded(): boolean {
    return (this.constructor as typeof Model).embedded;
  }

  public get pathPrefixGroup(): string | null {
    return (this.constructor as typeof Model).pathPrefixGroup;
  }
}
