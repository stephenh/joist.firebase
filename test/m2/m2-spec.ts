
import { ModelPromise, Store } from '@src/model';
import { expect } from 'chai';
import { Mock } from 'firemock';
import { Child } from './Child';
import { Parent } from './Parent';

describe('m2 Parent/Child with one-way child -> parent', () => {
  it('should be constructable with a parent instance', async () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db);
    // given a new parent
    const p: Parent = store.createRecord(Parent, { name: 'p' });
    // then we can create a child with it
    const c = store.createRecord(Child, { name: 'c', parent: p });
    // and both are stored in the db
    await store.saveAll();
    expect(db.db).to.deep.eq({
      parents: { id1: { name: 'p' }},
      children: { id2: { name: 'c', parent: 'id1' }}
    });
    // and we can read back out the parent
    expect(c.parent.instance).to.eq(p);
  });

  it('should be constructable with a parent promise', async () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db);
    // given an existing parent
    store.createRecord(Parent, { name: 'p' });
    // and we hvae a promise for it
    const mp: ModelPromise<Parent> = store.findRecord(Parent, 'id1');
    // then we can create a child with it
    const c = store.createRecord(Child, { name: 'c', parent: mp });
    // and both are stored in the db
    await store.saveAll();
    expect(db.db).to.deep.eq({
      parents: { id1: { name: 'p' }},
      children: { id2: { name: 'c', parent: 'id1' }}
    });
    // and we can read back out the parent
    expect(c.parent).to.eq(mp);
  });
});
