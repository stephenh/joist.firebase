
import { Store } from '@src/model';
import { Schema } from '@src/schema';
import { expect } from 'chai';
import { Mock } from 'firemock';
import { PrimitiveEntity } from './models/PrimitiveEntity';

describe('Store', () => {
  it('should save simple entities', () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db);
    // given a new test instance created via it's constructor
    const pe = PrimitiveEntity.newTestInstance(store);
    // then it is initially not saved
    expect(db.db).to.deep.eq({});
    // until save is called
    pe.save();
    // then it is saved to firebase
    expect(db.db).to.deep.eq({
      primitive_entities: {
        id1: {
          firstName: 'f',
          lastName: 'l',
          age: 50,
        }
      }
    });
  });

  it('should create simple entities', () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db);
    // given a new instance
    const pe = store.createRecord(PrimitiveEntity, PrimitiveEntity.newTestData);
    // then it is not stored in the db immediately
    expect(db.db).to.deep.eq({});
    // until save is called
    pe.save();
    expect(db.db).to.deep.eq({
      primitive_entities: {
        id1: {
          firstName: 'f',
          lastName: 'l',
          age: 50,
        }
      }
    });
  });

});
