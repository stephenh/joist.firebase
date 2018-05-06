
import { Schema } from '@src/schema';
import { Paths } from '@src/store';
import { DataSnapshot, Reference } from '../firebase';
import { log as parentLog, Model, ModelPromise, Store } from './';

const log = parentLog.child('instanceData');

/**
 * All of the ORM-related metadata for a given instance.
 *
 * These methods should be considered internal implementation details
 * and not called by client code.
 */
export class InstanceData<T extends Model> {

  public readonly model: T;
  public readonly store: Store;
  public readonly id: string;
  public readonly ref: Reference;
  public isNew: boolean = false;
  public isDeleted: boolean = false;
  public remoteAttributes: { [key: string]: any } = {}; // The state of the object in Firebase (as last seen)
  public localAttributes: { [key: string]: any } = {}; // Any local attribute changes that have not yet been submitted
  public atomicallyLinked: Model[] = []; // Other records that will be saved when this record is saved
  public readonly promise: ModelPromise<T>;
  private readonly schema: Schema;

  constructor(store: Store, model: T, id?: string) {
    this.store = store;
    this.model = model;
    this.schema = Schema.getSchema(model);
    this.id = id || store.newKey(this.fullModelsPath);
    this.ref = store.database.ref(`${this.fullModelsPath}/${this.id}`);
    this.promise = new ModelPromise<T>(this.id, this.modelName, (resolve, reject) => {
      this.ref.on('value', (dataSnapshot: DataSnapshot | null) => {
        const result: any = dataSnapshot != null ? dataSnapshot.val() : null;
        if (result) {
          this.setAttributesFrom(result);
          resolve(this.model);
        } else {
          if (this.isDeleted) {
            log('Received null data for deleted record, ignoring it');
            resolve(this.model);
          } else {
            reject(`Record not found for ${this}`);
          }
        }
      });
    });
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
    const value = this.localAttributes[name] || this.remoteAttributes[name];
    log('Get %s.%s as %s', this.model, name, value);
    return value;
  }

  public set(name: string, value: any): void {
    log('Set %s.%s to %s', this.model, name, value);
    this.localAttributes[name] = value;
  }

  public setAttributesFrom(snapshot: { [key: string]: any }): void {
    this.remoteAttributes = {};
    log('Got snapshot %o', snapshot);
    Object.keys(snapshot).forEach(k => {
      this.remoteAttributes[k] = snapshot[k];
    });
  }

  /** Record completed saving. Called by the store. */
  public async didSave(): Promise<void> {
    this.isNew = false;
    this.localAttributes = {};
  }

  public willUnload(): void {
    log(`Turning off ref for ${this.model.id}`);
    this.ref.off();
  }

  public async rawFirebaseValue(attribute: string): Promise<any> {
    const snapshot = await this.ref.once('value');
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
