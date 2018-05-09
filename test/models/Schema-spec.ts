
import { Store } from '@src/model';
import { Schema } from '@src/schema';
import { expect } from 'chai';
import { Mock } from 'firemock';
import { PrimitiveEntity } from '../m1/PrimitiveEntity';

describe('Schema', () => {
  it('should read properties', () => {
    const db = new Mock();
    const store = new Store(db, { basePath: '/base' });
    const pe = PrimitiveEntity.newTestInstance(store);
    const schema = Schema.getSchema(PrimitiveEntity);
    expect(schema.properties.length).to.eq(3);
  });
});
