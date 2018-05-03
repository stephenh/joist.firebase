
import { Data, InstanceData, log, Model, Store } from '@src/model';
import { defaultValue, PrimitiveProperty, Schema } from '@src/schema';
import 'reflect-metadata';

function property(): PropertyDecorator {
  return (proto: Object, name: string | symbol) => {
    const type: string = Reflect.getMetadata('design:type', proto, name).name;
    const schema = Schema.getSchema(proto);
    const prop = new PrimitiveProperty(name, type);
    schema.properties.push(prop);
    log('Defining %o on %o', prop, proto);
    Object.defineProperty(proto, name, {
      get: function (): any {
        // tslint:disable-next-line:no-invalid-this
        return prop.get(this as any);
      },
      set: function (value: any): any {
        // tslint:disable-next-line:no-invalid-this
        prop.set(this as any, value);
      }
    });
  };
}

export class PrimitiveEntity extends Model {

  public static modelName: string = 'primitive_entity';
  public static modelPath: string = 'primitive_entities';

  @property() public firstName: string = defaultValue.s;

  @property() public lastName: string = defaultValue.s;

  @property() public age: number = defaultValue.n;

  constructor(store: Store, data: Data<PrimitiveEntity>) {
    super(store, data);
  }

  public static get newTestData(): Data<PrimitiveEntity> {
    return { firstName: 'f', lastName: 'l', age: 50 };
  }

  public static newTestInstance(store: Store): PrimitiveEntity {
    return new PrimitiveEntity(store, PrimitiveEntity.newTestData);
  }
}
