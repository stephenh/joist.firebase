
import { Schema } from '@src/schema';
import { Paths } from '@src/store';
import { Reference } from '../firebase';
import { log as parentLog, Model, Store } from './';

const log = parentLog.child('instanceData');

/**
 * All of the ORM-related metadata for a given instance.
 *
 * These methods should be considered internal implementation details
 * and not called by client code.
 */
export class InstanceData {

  public readonly model: Model;
  public readonly store: Store;
  public isNew: boolean = false;
  public isDeleted: boolean = false;
  public ref?: Reference;
  public remoteAttributes: { [key: string]: any } = {}; // The state of the object in Firebase (as last seen)
  public localAttributes: { [key: string]: any } = {}; // Any local attribute changes that have not yet been submitted
  public atomicallyLinked: Model[] = []; // Other records that will be saved when this record is saved
  public embeddedRecords: { [attribute: string]: { [id: string]: Model } } = {}; // Any embedded records that have been accessed via their hasMany or belongsTo relationship - This is used to track future updates
  public embeddedIn: Model | null = null; // The record this embedded record is attached to
  private readonly schema: Schema;

  constructor(store: Store, model: Model) {
    this.store = store;
    this.model = model;
    this.schema = Schema.getSchema(model);
  }

  /** Returns the path to the models in firebase, e.g. /basePath/blogs. */
  public get fullModelsPath(): string {
    let path = this.store.basePath;
    if (this.pathPrefixGroup) {
      log('pathPrefixGroup %s', this.pathPrefixGroup);
      const pathPrefix = this.store.pathPrefix[this.pathPrefixGroup];
      if (pathPrefix === null || pathPrefix === undefined) {
        throw Error(`Path prefix ${this.pathPrefixGroup} is not configured in the store`);
      }
      path += pathPrefix;
    }
    path += `/${this.modelPath}`;
    return path;
  }

  /** Returns the path to the instance in firebase, e.g. /basePath/blogs/1. */
  public get fullInstancePath(): string {
    return `${this.fullModelsPath}/${this.model.id}`;
  }

  public addPaths(paths: Paths, parentPath?: string): void {
    this.schema.properties.forEach(p => {
      const key = `${this.fullInstancePath}/${p.name}`;
      const serDeValue = this.localAttributes[p.name];
      log('Adding %s = %s', key, serDeValue);
      paths.set(key, serDeValue);
    });
  }

  public get(name: string): any {
    const value = this.localAttributes[name];
    log('Get %s.%s as %s', this.model, name, value);
    return value;
  }

  public set(name: string, value: any): void {
    log('Set %s.%s to %s', this.model, name, value);
    this.localAttributes[name] = value;
  }

  public setAttributesFrom(snapshot: { [key: string]: any }): void {
    Object.keys(snapshot).forEach(k => {
      log('Set from snapshot %s.%s to %s', this.model, k, snapshot[k]);
      this.localAttributes[k] = snapshot[k];
    });
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
    return (this.model.constructor as typeof Model).modelName;
  }

  public get modelPath(): string {
    return (this.model.constructor as typeof Model).modelPath;
  }

  public get pathPrefixGroup(): string | undefined {
    return (this.model.constructor as typeof Model).pathPrefixGroup;
  }
}
