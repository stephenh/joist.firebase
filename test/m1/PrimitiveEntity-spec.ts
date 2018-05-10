
import { Store } from '@src/model';
import { Mock } from 'firemock';
import { log } from '../';
import { PrimitiveEntity } from './PrimitiveEntity';

describe('PrimitiveEntity', () => {
  it('should be constructable directly without an id', () => {
    const db = new Mock();
    const store = new Store(db);
    const pe = store.createRecord(PrimitiveEntity, { firstName: 'f', lastName: 'l', age: 1 });
    expect(pe.firstName).toEqual('f');
    expect(pe.lastName).toEqual('l');
    expect(pe.id).not.toBeUndefined();
  });

  it('should be constructable directly with an id', () => {
    const db = new Mock();
    const store = new Store(db);
    const pe = store.createRecord(PrimitiveEntity, { id: 'existing', firstName: 'f', lastName: 'l', age: 1 });
  });
});
