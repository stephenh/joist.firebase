
import { Model } from '../model';

/**
 * The promises returned by the model contain an extra 'id' attribute that is available prior to the promise being resolved.
 * This enables records to be added and removed from relationships without having to retrieve the record first
 */
export class ModelPromise<T extends Model> implements PromiseLike<T> {
  public readonly id: string;
  public readonly modelName: string;
  public get instance(): T | undefined { return this._instance; }
  private _instance?: T;
  private readonly promise: Promise<T>;

  constructor(
    id: string,
    modelName: string,
    executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
    this.id = id;
    this.modelName = modelName;
    this.promise = new Promise<T>(executor);
    this.then(i => { this._instance = i; });
  }

  public then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  public toString(): string {
    return `${this.modelName}#${this.id} ${this._instance === undefined ? 'pending' : 'resolved'}`;
  }
}
