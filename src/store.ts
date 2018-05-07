
import * as debug from 'debug';
import { v1, v4 } from 'uuid';
import { log as parentLog } from './';
import { DataSnapshot, FirebaseApi, Reference } from './firebase';
import { Data, Model, ModelClass, ModelPromise } from './model';

const log = parentLog.child('store');

// The data we'll upload to firebase, e.g. ref('/').update(paths)
export class Paths extends Map<string, string | number | null> {
  /** Helper function for nicer assertions. */
  public toObject(): any {
    const o: any = {};
    this.forEach((v, k) => o[k] = v);
    return o;
  }
}

/**
 * The store acts as our gateway to Firebase, as well as a local unit of work.
 *
 * There should be a single store instance per "thread", e.g. a dedicated
 * unit of business logic "load data, doing something, save data".
 */
export class Store {

  public basePath: string;
  public database: FirebaseApi;
  /** Links a 'group' key to a path in the DB. eg 'team' : '/team/123456'. */
  public pathPrefix: { [group: string]: string } = {};
  /** Whether to generate UUID id's (v1 or v4) or, if undefined, use 'push' style id's. */
  private _useUUID?: number;
  private _activeRecords: { [modelName: string]: { [id: string]: ModelPromise<Model> } } = {};

  /**
   * Initialize a store.
   *
   * @param basePath a 'basePath' to prefix all records in Firebase, effectively 'chroot'ing them.
   * @param useUUID if 1 or 2, will use UUIDv2 generated ids, otherwise `push()` generated ids.
   */
  constructor(database: FirebaseApi, options?: { basePath?: string; useUUID?: number }) {
    this.database = database;
    this.basePath = (options && options.basePath) || '';
    this._useUUID = (options && options.useUUID) || undefined;
  }

  public createRecord<T extends Model>(recordClass: ModelClass<T>, data: Data<T>): T {
    // The constructor will automatically assign a v4 uuid if an id was not provided
    const record = new recordClass(this, data);
    log('Created new record %s', record);
    this.storeActiveRecord(record.instanceData.promise);
    return record;
  }

  public findRecord<T extends Model>(recordClass: ModelClass<T>, id: string): ModelPromise<T> {
    const activeRecord = this.retrieveActiveRecord(recordClass, id);
    if (activeRecord) {
      log('Found active record %s', activeRecord);
      return activeRecord;
    }
    log('Looking up %s#%s', recordClass.modelName, id);
    const record = new recordClass(this, { id } as any as Data<T>);
    const mp = record.instanceData.promise;
    this.storeActiveRecord(mp);
    return mp;
  }

  /**
   * Get a record by class and ID without triggering a request to Firebase. If the record is already loaded
   * it will be returned, otherwise null will be returned.
   */
  public peekRecord<T extends Model>(recordClass: ModelClass<T>, id: string): T | undefined {
    log('Peeking for active record %s:%s', recordClass, id);
    const mp = this.retrieveActiveRecord(recordClass, id);
    if (mp) {
      return mp.instance;
    } else {
      return undefined;
    }
  }

  /**
   * Unloads the record from the store. This will cause the record to be destroyed and freed up for garbage collection.
   */
  public unloadRecord(record: Model): void {
    record.instanceData.willUnload();
    const records = this._activeRecords[record.instanceData.modelName];
    if (records) {
      delete records[record.id];
    }
  }

  /** Saves all records atomically. */
  public async saveAll(): Promise<void> {
    const recordsToSave: Model[] = [];
    const updates = {};
    Object.keys(this._activeRecords).map(modelName => {
      Object.keys(this._activeRecords[modelName]).map(id => {
        const mp = this._activeRecords[modelName][id];
        if (mp.instance) {
          recordsToSave.push(mp.instance);
        }
      });
    });
    return this.saveRecords(recordsToSave);
  }

  /**
   * Saves a list of records atomically
   * @param records An array of records to save
   */
  public async saveRecords(records: Model[]): Promise<void> {
    const recordsToSave: Model[] = records.slice();
    const seenRecords: Model[] = records.slice();
    const paths = new Paths();
    while (recordsToSave.length > 0) {
      const recordToSave: Model = recordsToSave[0]; // Could just shift here but typescript thinks it might be null if we do
      recordsToSave.shift();
      recordToSave.instanceData.addPaths(paths);
      // Add atomically linked records to list of records to save
      recordToSave.instanceData.atomicallyLinked.map(linkedRecord => {
        if (!seenRecords.includes(linkedRecord)) {
          recordsToSave.push(linkedRecord);
          seenRecords.push(linkedRecord);
        }
      });
    }
    await this.updatePaths(paths.toObject());
    await Promise.all(seenRecords.map(r => r.instanceData.didSave()));
  }

  /**
   * Saves the record. Intended by be called from Model, rather than directly
   * Will also save records that are atomically linked
   * @param record The record to save
   */
  public async _save(record: Model): Promise<void> {
    return this.saveRecords([record]);
  }

  public newKey(path: string): string {
    if (this._useUUID) {
      switch (this._useUUID) {
        case 1:
          return v1();
        case 4:
          return v4();
        default:
          throw Error(`Unsupported UUID version requested ${this._useUUID}, valid versions are 1 and 4`);
      }
    } else {
      // Use the firebase generated key. See: https://firebase.google.com/docs/reference/js/firebase.database.Reference#push
      return this.database.ref(path).push().key as string;
    }
  }

  private async updatePaths(updates: { [path: string]: any }): Promise<void> {
    log('Performing firebase updates: %o', updates);
    try {
      await this.database.ref('/').update(updates);
    } catch (error) {
      log('Failed to save updates: %s, data: %o', error, updates);
      throw error;
    }
  }

  private storeActiveRecord(promise: ModelPromise<Model>): void {
    const { id, modelName } = promise;
    if (!(modelName in this._activeRecords)) {
      this._activeRecords[modelName] = {};
    }
    this._activeRecords[modelName][id] = promise;
  }

  private retrieveActiveRecord<T extends Model>(recordClass: ModelClass<T>, id: string): ModelPromise<T> | undefined {
    const modelName = recordClass.modelName;
    if (this._activeRecords[modelName] !== undefined && this._activeRecords[modelName][id] !== undefined) {
      return this._activeRecords[modelName][id] as ModelPromise<T>;
    } else {
      return undefined;
    }
  }

}
