
import { property } from '@src/decorators';
import { Data, Model, Store } from '@src/model';
import { defaultValue } from '@src/schema';

export class PrimitiveEntity extends Model {

  public static modelName: string = 'primitive_entity';
  public static modelPath: string = 'primitive_entities';

  @property() public firstName: string = defaultValue.s;

  @property() public lastName: string = defaultValue.s;

  @property() public age: number = defaultValue.n;

  public static get newTestData(): Data<PrimitiveEntity> {
    return { firstName: 'f', lastName: 'l', age: 50 };
  }

  public static newTestInstance(store: Store): PrimitiveEntity {
    return new PrimitiveEntity(store, PrimitiveEntity.newTestData);
  }
}
