
import { Model, Store, log } from './';
import { Reference } from '../firebase';

/**
 * All of the ORM-related metadata for a given instance.
 *
 * These methods should be considered internal implementation details
 * and not called by client code.
 */
export class ModelMetadata {

  public readonly model: Model;
  public readonly store: Store;
  public isNew: boolean = false;
  public isDeleted: boolean = false;
  public ref?: Reference;
  public remoteAttributes: { [key: string]: any; } = {}; // The state of the object in Firebase (as last seen)
  public localAttributes: { [key: string]: any; } = {}; // Any local attribute changes that have not yet been submitted
  public atomicallyLinked: Model[] = []; // Other records that will be saved when this record is saved
  public embeddedRecords: { [attribute: string]: { [id: string]: Model } } = {}; // Any embedded records that have been accessed via their hasMany or belongsTo relationship - This is used to track future updates
  public embeddedIn: Model | null = null; // The record this embedded record is attached to

  constructor(store: Store, model: Model) {
    this.store = store;
    this.model = model;
  }


  /** Returns the path to the models in firebase, e.g. /basePath/blogs. */
  public get fullModelsPath(): string {
    let path = this.store.basePath;
    if (this.pathPrefixGroup !== null) {
      const pathPrefix = this.store.pathPrefix[this.pathPrefixGroup];
      if (pathPrefix === null || pathPrefix === undefined) {
        throw Error(`Path prefix ${this.pathPrefixGroup} is not configured in the store`);
      }
      path += pathPrefix;
    }
    path += '/' + this.modelPath;
    return path;
  }

  /** Returns the path to the instance in firebase, e.g. /basePath/blogs/1. */
  public get fullInstancePath(): string {
    return `${this.fullModelsPath}/${this.model.id}`;
  }

  public pathsToSave(parentPath?: string): { [key: string]: number | string | null } {
    return {};
  }

  public setAttributesFrom(object: { [key: string]: any }): void {
    this.remoteAttributes = {};
  }

  /** Record completed saving. Called by the store. */
  public async didSave(): Promise<void> {
    // Ensure this record is linked to firebase
    // await this.store._linkToFirebase(this);
    this.isNew = false;
    // Clear local attributes as change has been saved
    this.localAttributes = {};
  }

  public willUnload(): void {
    if (this.ref !== undefined && this.ref !== null) {
      log(`removing ref for ${this.model.id}`);
      this.ref.off();
      this.ref = undefined;
    }
  }

  public async rawFirebaseValue(attribute: string): Promise<any> {
    const snapshot = await this.store.database.ref(this.fullInstancePath).once('value');
    const val = snapshot.val();
    return val[attribute];
  }

  public get modelName(): string {
    return (this.constructor as typeof Model).modelName;
  }

  public get modelPath(): string {
    return (this.constructor as typeof Model).modelPath;
  }

  public get pathPrefixGroup(): string | null {
    return (this.constructor as typeof Model).pathPrefixGroup;
  }
}