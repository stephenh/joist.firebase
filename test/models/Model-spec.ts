
import { Data, Store } from '@src/model';
import { Log } from '@src/utils/Log';
import { expect } from 'chai';
import { Mock } from 'firemock';
import { PrimitiveEntity } from './PrimitiveEntity';

const log = Log.create('joist:test');

describe('Model', () => {
  it('should get paths right', () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db, { basePath: '/base' });
    const pe = PrimitiveEntity.newTestInstance(store);
    expect(pe.instanceData.modelName).to.be.eq('primitive_entity');
    expect(pe.instanceData.modelPath).to.be.eq('primitive_entities');
    expect(pe.instanceData.fullInstancePath).to.be.eq('/base/primitive_entities/id1');
    pe.unloadRecord();
  });

  it('should be read from by firebase', async () => {
    const db = new Mock().useDeterministicIds();
    const d: Data<PrimitiveEntity> = { firstName: 'ff', lastName: 'll', age: 51 };
    db.ref('/primitive_entities/id1').setSync(d);
    const store = new Store(db);
    const pe = await store.findRecord(PrimitiveEntity, 'id1');
    expect(pe.firstName).to.eq('ff');
    expect(pe.lastName).to.eq('ll');
    expect(pe.age).to.eq(51);
    pe.unloadRecord();
  });

  it('should save to firebase', async () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db);
    // given a new instance
    const pe = PrimitiveEntity.newTestInstance(store);
    // and we expect there to be local attributes
    expect(Object.keys(pe.instanceData.localAttributes)).to.deep.eq(['firstName', 'lastName', 'age']);
    // when the entity is saved
    await pe.save();
    // then it shows up in firebase
    expect(db.get('/primitive_entities/id1/firstName')).to.eq('f');
    // and the remote attributes have been picked up
    expect(Object.keys(pe.instanceData.remoteAttributes)).to.deep.eq(['firstName', 'lastName', 'age']);
    // and the local attributes cleared out
    expect(Object.keys(pe.instanceData.localAttributes)).to.deep.eq([]);
    pe.unloadRecord();
  });

  it('should be updated by firebase', async () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db);
    // given a new instance
    const pe = PrimitiveEntity.newTestInstance(store);
    // and we expect there to be local attributes
    expect(Object.keys(pe.instanceData.localAttributes)).to.deep.eq(['firstName', 'lastName', 'age']);
    // when the entity is saved
    await pe.save();
    // then it shows up in firebase
    expect(db.get('/primitive_entities/id1/firstName')).to.eq('f');
    db.ref('/primitive_entities/id1/firstName').setSync('ff');
    expect(db.get('/primitive_entities/id1/firstName')).to.eq('ff');
    expect(pe.firstName).to.eq('ff');
    pe.unloadRecord();
  });
});
