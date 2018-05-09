
import { hasOne, model, property } from '@src/decorators';
import { Data, Model, ModelPromise, Store } from '@src/model';
import { defaultValue } from '@src/schema';
import { Foo } from './Foo';

@model({ path: 'bar'})
export class Bar extends Model {

  @property() public name: string = defaultValue.s;

  @hasOne(Foo, { inverse: 'bar' }) public foo: ModelPromise<Foo> = defaultValue.mp();
}
