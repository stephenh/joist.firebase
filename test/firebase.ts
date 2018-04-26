
import * as firebase from 'firebase';
import * as admin from 'firebase-admin';
import { FirebaseApi } from '../src/firebase';

// show that each firebase API can type-check to our abstraction layer
declare var db1: ReturnType<typeof firebase.database>;
declare var db2: ReturnType<typeof admin.database>;

declare var api: FirebaseApi;
api = db1;
api = db2;
