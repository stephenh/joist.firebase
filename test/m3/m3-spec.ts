
import { ModelPromise, Store } from '@src/model';
import { expect } from 'chai';
import { Mock } from 'firemock';
import { Bar } from './Bar';
import { Foo } from './Foo';

describe('m3 One-to-one with two-way connection between entities', () => {
  it('should be constructable with an instance', async () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db);
    // given a new foo
    const p: Foo = store.createRecord(Foo, { name: 'p' });
    // then we can create a child with it
    const c = store.createRecord(Bar, { name: 'c', foo: p });
    // and both are stored in the db
    await store.saveAll();
    expect(db.db).to.deep.eq({
      foo: { id1: { name: 'p', bar: 'id2' }},
      bar: { id2: { name: 'c', foo: 'id1' }}
    });
    // and we can read back out the foo
    expect(c.foo.instance).to.eq(p);
  });

  it('should be constructable with a promise', async () => {
    const db = new Mock().useDeterministicIds();
    const store = new Store(db);
    // given an existing parent
    store.createRecord(Foo, { name: 'p' });
    // and we hvae a promise for it
    const mp: ModelPromise<Foo> = store.findRecord(Foo, 'id1');
    // then we can create a child with it
    const c = store.createRecord(Bar, { name: 'c', foo: mp });
    // and both are stored in the db
    await store.saveAll();
    expect(db.db).to.deep.eq({
      foo: { id1: { name: 'p', bar: 'id2' }},
      bar: { id2: { name: 'c', foo: 'id1' }}
    });
    // and we can read back out the parent
    expect(c.foo).to.eq(mp);
  });
});
