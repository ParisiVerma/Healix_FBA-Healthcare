import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import defaultConfig from './firebase-applet-config.json';

const firebaseConfig = defaultConfig;

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize firestore
export const db = (firebaseConfig as any).firestoreDatabaseId 
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

export const checkFirebaseStatus = async (): Promise<{ ok: boolean; message: string; latencyMs: number }> => {
  const start = performance.now();
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    const latencyMs = Math.round(performance.now() - start);
    return { ok: true, message: 'Firebase Auth & Firestore Connected', latencyMs };
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - start);
    if (error?.message?.includes('offline') || error?.code === 'unavailable') {
      return { ok: false, message: 'Firebase Offline / Configuration Pending', latencyMs };
    }
    // Return true for initialized app even if test collection is missing permission
    return { ok: true, message: 'Firebase Auth Active', latencyMs };
  }
};

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  type FirebaseUser
};
