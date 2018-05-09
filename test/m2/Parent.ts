
import { property } from '@src/decorators';
import { Data, Model, Store } from '@src/model';
import { defaultValue } from '@src/schema';
import { Child } from './Child';

export class Parent extends Model {

  public static modelName: string = 'parent';
  public static modelPath: string = 'parents';

  @property() public name: string = defaultValue.s;

  // @hasMany() public children: Child[] = [];

}
