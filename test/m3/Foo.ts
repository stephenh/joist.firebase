
import { hasOne, model, property } from '@src/decorators';
import { Model, ModelPromise } from '@src/model';
import { defaultValue } from '@src/schema';
import { Bar } from './Bar';

@model({ path: 'foo' })
export class Foo extends Model {

  @property() public name: string = defaultValue.s;

  @hasOne(Bar, { inverse: 'foo' }) public bar?: ModelPromise<Bar> = defaultValue.mp();

}
