

import { Data, Model, ModelMetadata, Store } from '@src/model';

export class PrimitiveEntity extends Model {
  public static modelName: string = 'primitive_entity';
  public static modelPath: string = 'primitive_entities';

  name: string = '';

  constructor(store: Store, data: Data<PrimitiveEntity>) {
    super(store, data);
    Object.assign(this, data);
  }
}

