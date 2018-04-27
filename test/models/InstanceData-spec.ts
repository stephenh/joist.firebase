
import { Store } from '@src/model';
import { expect } from 'chai';
import { Mock } from 'firemock';
import { log } from '../';
import { PrimitiveEntity } from './PrimitiveEntity';

describe('InstanceData', () => {
  it('should return primitive paths', () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db);
    const pe = new PrimitiveEntity(store, { name: 'name1' });
    const paths = pe.instanceData.pathsToSave();
    expect(paths.toObject()).to.be.eq({ '/primitive_entities/1/name': 'name1' });
  });
});
