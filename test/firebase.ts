
import * as firebase from 'firebase';
import * as admin from 'firebase-admin';
import { FirebaseApi } from '../src/firebase';

// show that each firebase API can type-check to our abstraction layer
describe('firebase', () => {
  it('should allow either firebase or firebase-admin to be used', () => {
    // we don't bother instantiating both, and instead just make sure the type check passes
    let db1: ReturnType<typeof firebase.database> | undefined;
    let db2: ReturnType<typeof admin.database> | undefined;
    let api: FirebaseApi | undefined;
    api = db1;
    api = db2;
  });
});
