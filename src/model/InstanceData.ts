
import { Schema } from '@src/schema';
import { Paths } from '@src/store';
import * as _ from 'lodash';
import { DataSnapshot, Reference } from '../firebase';
import { Data, log as parentLog, Model, ModelPromise, Store } from './';

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

  constructor(store: Store, model: T, data: Data<T>) {
    this.store = store;
    this.model = model;
    this.schema = Schema.getSchemaForInstance(model);
    // There are three potential cases here:
    // 1) findRecord for an existing record, we get passed what should be an existing Firebase id
    // 2) createRecord for a new record, with a user-specific key
    // 3) createRecord for a new record, with no key given, so we get one from the store
    const providedId: string | undefined = data.id;
    this.id = providedId ? providedId : store.newKey(this.fullModelsPath);
    // All existing records are instantiated with just data={id} (via an 'as any' hack)
    this.isNew = !_.isEqual(Object.keys(data), ['id']);
    this.ref = store.database.ref(`${this.fullModelsPath}/${this.id}`);
    const alreadyAvailable = this.isNew ? this.model : undefined;
    this.promise = new ModelPromise<T>(this.id, this.modelName, alreadyAvailable, (resolve, reject) => {
      // If we're a new model, we don't need to wait for Firebase to resolve the promise
      if (this.isNew) {
        resolve(this.model);
      }
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
    log('Set %s.%s to %o', this.model, name, value);
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
    if (!this.schema.modelName) {
      throw new Error('Missing @model annotation');
    }
    return this.schema.modelName;
  }

  public get modelPath(): string {
    if (!this.schema.modelPath) {
      throw new Error('Missing @model annotation');
    }
    return this.schema.modelPath;
  }

  public get pathPrefixGroup(): string | undefined {
    return undefined; // (this.model.constructor as typeof Model).pathPrefixGroup;
  }
}
