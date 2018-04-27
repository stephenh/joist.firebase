
import { Store } from '@src/model';
import { Schema } from '@src/schema';
import { expect } from 'chai';
import { Mock } from 'firemock';
import { PrimitiveEntity } from './models/PrimitiveEntity';

describe('Store', () => {
  it('should save simple entities', () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db);
    const pe = new PrimitiveEntity(store, { firstName: 'f', lastName: 'l' });
    pe.save();
    expect(db.db).to.deep.eq({ primitive_entities: { id1: { firstName: 'f', lastName: 'l' } } });
  });
});
