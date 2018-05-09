
import { hasOne, model, property } from '@src/decorators';
import { Model, ModelPromise } from '@src/model';
import { defaultValue } from '@src/schema';
import { Parent } from './Parent';

@model({ path: 'children' })
export class Child extends Model {

  @property() public name: string = defaultValue.s;

  @hasOne(Parent) public parent: ModelPromise<Parent> = ({} as any as ModelPromise<Parent>);

}
