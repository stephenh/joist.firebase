
import { Data, Store } from '@src/model';
import { Log } from '@src/utils/Log';
import { expect } from 'chai';
import { Mock } from 'firemock';
import { PrimitiveEntity } from './PrimitiveEntity';

const log = Log.create('joist:test');

describe('Model', () => {
  xit('should get paths right', () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db, { basePath: '/base' });
    const pe = PrimitiveEntity.newTestInstance(store);
    expect(pe.instanceData.modelName).to.be.eq('primitive_entity');
    expect(pe.instanceData.modelPath).to.be.eq('primitive_entities');
    expect(pe.instanceData.fullInstancePath).to.be.eq('/base/primitive_entities/id1');
  });

  xit('should be read from by firebase', async () => {
    const db = new Mock().useDeterministicIds();
    const d: Data<PrimitiveEntity> = { firstName: 'ff', lastName: 'll', age: 51 };
    log('Saving %o to db', d);
    db.ref('/primitive_entities/id1').setSync(d);
    const store = new Store(db);
    log('Calling findRecord');
    const pe = await store.findRecord(PrimitiveEntity, 'id1');
    expect(pe.firstName).to.eq('ff');
    expect(pe.lastName).to.eq('ll');
    expect(pe.age).to.eq(51);
  });

  it('should be updated by firebase', () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db);
    const pe = PrimitiveEntity.newTestInstance(store);
    pe.save();
    expect(db.get('/primitive_entities/id1/firstName')).to.eq('f');
    db.ref('/primitive_entities/id1/firstName').setSync('ff');
    expect(db.get('/primitive_entities/id1/firstName')).to.eq('ff');
    expect(pe.firstName).to.eq('ff');
  });
});
