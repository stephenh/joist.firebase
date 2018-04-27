
import { Store } from '@src/model';
import { Paths } from '@src/store';
import { expect } from 'chai';
import { Mock } from 'firemock';
import { log } from '../';
import { PrimitiveEntity } from './PrimitiveEntity';

describe('InstanceData', () => {
  it('should return primitive paths', () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db);
    const pe = new PrimitiveEntity(store, { firstName: 'f', lastName: 'l' });
    const paths = new Paths();
    pe.instanceData.addPaths(paths);
    expect(paths.toObject()).to.deep.eq({
      '/primitive_entities/id1/firstName': 'f',
      '/primitive_entities/id1/lastName': 'l',
    });
  });
});
