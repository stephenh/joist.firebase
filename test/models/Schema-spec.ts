
import { Store } from '@src/model';
import { Schema } from '@src/schema';
import { expect } from 'chai';
import { Mock } from 'firemock';
import { PrimitiveEntity } from './PrimitiveEntity';

describe('Schema', () => {
  it('should read properties', () => {
    const db = new Mock();
    const store = new Store(db, { basePath: '/base' });
    const pe = new PrimitiveEntity(store, { id: '1', firstName: 'f', lastName: 'l' });
    const schema = Schema.getSchema(PrimitiveEntity);
    expect(schema.properties.length).to.eq(2);
  });
});
