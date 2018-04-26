
import { PrimitiveEntity } from './PrimitiveEntity';
import { Data, Store } from '@src/model';
import { Mock } from 'firemock';
import { FirebaseApi } from '@src/firebase';
import { NotId } from '@src/model/Data';

type d = Data<PrimitiveEntity>;
type e = NotId<PrimitiveEntity>;

describe('PrimitiveEntity', () => {
  it('should be constructable directly without an id', () => {
    const api: FirebaseApi = new Mock();
    const store = new Store(api);
    const pe = new PrimitiveEntity(store, { name: 'name1' });
  });

  it('should be constructable directly with an id', () => {
    const api: FirebaseApi = new Mock();
    const store = new Store(api);
    const pe = new PrimitiveEntity(store, { id: 'existing', name: 'name1' });
  });
});