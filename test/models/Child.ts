
import { belongsTo, property } from '@src/decorators';
import { Data, Model, ModelPromise, Store } from '@src/model';
import { defaultValue } from '@src/schema';
import { Parent } from './Parent';

export class Child extends Model {

  public static modelName: string = 'child';
  public static modelPath: string = 'children';

  @property() public name: string = defaultValue.s;

  @belongsTo(Parent) public parent: ModelPromise<Parent> = ({} as any as ModelPromise<Parent>);

}
