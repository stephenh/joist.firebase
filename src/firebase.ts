
/**
 * An abstraction of the low-level Firebase API.
 *
 * Allows us to use either firebase-admin (in Node environments) or
 * firebase (in web environments).
 */
export interface FirebaseApi {
  ref(path?: string): Reference;
}

export interface DataSnapshot {
  val: any;
}

// ninjafire does not currently need the ThenableReference return type
// on Reference.push, but it compiles if needed in the future.
// export interface ThenableReference extends Reference, PromiseLike<any> {}

export interface Reference {
  key: string | null;

  update(updates: { [path: string]: any }): void;

  push(value?: any, onComplete?: (a: Error | null) => any): Reference;

  off(): void;

  on(
    eventType: string,
    callback: (a: DataSnapshot | null, b?: string) => any,
    cancelCallbackOrContext?: Object | null,
    context?: Object | null,
  ): void;

  once(
    eventType: string,
    successCallback?: (a: DataSnapshot, b?: string) => any,
    failureCallbackOrContext?: Object | null,
    context?: Object | null,
  ): Promise<any>;
}
