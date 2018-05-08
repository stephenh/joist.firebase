
import { Store } from '@src/model';
import { expect } from 'chai';
import { Mock } from 'firemock';
import { log } from '../';
import { PrimitiveEntity } from './PrimitiveEntity';

describe('PrimitiveEntity', () => {
  it('should be constructable directly without an id', () => {
    const db = new Mock();
    const store = new Store(db);
    const pe = store.createRecord(PrimitiveEntity, { firstName: 'f', lastName: 'l', age: 1 });
    expect(pe.firstName).to.be.eq('f');
    expect(pe.lastName).to.be.eq('l');
    expect(pe.id).to.not.eq(undefined);
  });

  it('should be constructable directly with an id', () => {
    const db = new Mock();
    const store = new Store(db);
    const pe = store.createRecord(PrimitiveEntity, { id: 'existing', firstName: 'f', lastName: 'l', age: 1 });
  });
});
