
import { Store } from '@src/model';
import { expect } from 'chai';
import { Mock } from 'firemock';
import { PrimitiveEntity } from './PrimitiveEntity';

describe('Model', () => {
  it('should get paths right', () => {
    const db = new Mock();
    const store = new Store(db, { basePath: '/base' });
    const pe = new PrimitiveEntity(store, { id: '1', name: 'name1' });
    expect(pe.instanceData.modelName).to.be.eq('primitive_entity');
    expect(pe.instanceData.modelPath).to.be.eq('primitive_entities');
    expect(pe.instanceData.fullInstancePath).to.be.eq('/base/primitive_entities/1');
  });
});
