
import { model, property } from '@src/decorators';
import { Model } from '@src/model';
import { defaultValue } from '@src/schema';

@model({ path: 'parents' })
export class Parent extends Model {

  @property() public name: string = defaultValue.s;

  // @hasMany() public children: Child[] = [];

}
