import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCZu2fqupUSOsMAHwbKO07QwzmiAT-JxgY",
  authDomain: "pawmitra-2803.firebaseapp.com",
  projectId: "pawmitra-2803",
  storageBucket: "pawmitra-2803.firebasestorage.app",
  messagingSenderId: "653538677182",
  appId: "1:653538677182:web:a95dac7a37658609a469ef",
  measurementId: "G-2RJE86TE40"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
