
import { PrimitiveEntity } from './PrimitiveEntity';
import { Store } from '@src/model';
import { Mock } from 'firemock';
import { expect } from 'chai';
import { log } from '../';
import 'mocha';

describe('PrimitiveEntity', () => {
  it('should be constructable directly without an id', () => {
    const db = new Mock();
    const store = new Store(db);
    const pe = new PrimitiveEntity(store, { name: 'name1' });
    expect(pe.name).to.be.eq('name1');
    expect(pe.id).to.not.be.undefined;
  });

  it('should be constructable directly with an id', () => {
    const db = new Mock();
    const store = new Store(db);
    const pe = new PrimitiveEntity(store, { id: 'existing', name: 'name1' });
  });
});