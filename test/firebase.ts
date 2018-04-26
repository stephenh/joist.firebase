
import * as firebase from 'firebase';
import * as admin from 'firebase-admin';
import { FirebaseApi } from '../src/firebase';

// show that each firebase API can type-check to our abstraction layer
const db1: ReturnType<typeof firebase.database> | undefined = null;
const db2: ReturnType<typeof admin.database> | undefined = null;

let api: FirebaseApi | undefined;
api = db1;
api = db2;
