
import { Store } from '@src/model';
import { Paths } from '@src/store';
import { Mock } from 'firemock';
import { log } from '../';
import { PrimitiveEntity } from '../m1/PrimitiveEntity';

describe('InstanceData', () => {
  it('should return primitive paths', () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db);
    const pe = PrimitiveEntity.newTestInstance(store);
    const paths = new Paths();
    pe.instanceData.addPaths(paths);
    expect(paths.toObject()).toEqual({
      '/primitive_entities/id1/age': 50,
      '/primitive_entities/id1/firstName': 'f',
      '/primitive_entities/id1/lastName': 'l',
    });
  });
});
