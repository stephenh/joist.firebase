
import { InstanceData } from './';

// Ignore functions on the model, e.g. save()
export type PropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];

// And ignore our internal metdata property
export type NotInternalNames<T> = { [K in keyof T]: T[K] extends InstanceData<any> ? never : K }[keyof T];

// And ignore the id property
export type NotId<T> = { [K in keyof T]: K extends 'id' ? never : K }[keyof T];

// Add back id but as an optional parameter
export type Data<T> = Pick<T, PropertyNames<T> & NotInternalNames<T> & NotId<T>> & { id?: string };

