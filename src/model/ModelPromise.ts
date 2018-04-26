
import { Model } from '../model';

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