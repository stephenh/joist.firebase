
import { InstanceData, ModelPromise } from './';

// Ignore functions on the model, e.g. save()
export type PropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];

// And ignore our internal metdata property
export type NotInternalNames<T> = { [K in keyof T]: T[K] extends InstanceData<any> ? never : K }[keyof T];

// And ignore the id property
export type NotId<T> = { [K in keyof T]: K extends 'id' ? never : K }[keyof T];

export type DataProps<T> = Pick<T, PropertyNames<T> & NotInternalNames<T> & NotId<T>> & { id?: string };

export type DataWithPromisesAndModels<T> = {
  [K in keyof T]: T[K] extends ModelPromise<infer U> ? ModelPromise<U> | U : T[K];
};

/**
 * For a given model `T`, the attributes to instantiate a new instance.
 *
 * E.g. for a Employee with a required name, this would be `{ id?: string, name: string }`.
 *
 * With a required last name, and optional first name, this would be: `{ id?: string, firstName?: string, lastName: string }`
 *
 * To construct this, we strip all the method properties and internal ORM properties
 * from `T`, so that we're left with the primitive/reference properties.
 *
 * Note that `id` is always `string?` because for a newly-created instance, the client is
 * allowed to either pass their own client-assigned id (if `id` is defined) or defer to
 * the ORM library for its own client-assigned id (if `id` is not defined). The ORM-assigned
 * id will be one of Firebase id, UUID v1, or UUID v4, based on the store config.
 */
export type Data<T> = DataWithPromisesAndModels<DataProps<T>>;

