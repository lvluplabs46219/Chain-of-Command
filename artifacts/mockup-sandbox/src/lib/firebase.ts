import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "cs-poc-eg8ozwut8ajxewx5eqbdsjg",
  appId: "1:851724091652:web:81835662279dc34a35d051",
  apiKey: "AIzaSyCED_UZZqFseXbMYyocgsD4iZGrsStUQGc",
  authDomain: "cs-poc-eg8ozwut8ajxewx5eqbdsjg.firebaseapp.com",
  storageBucket: "cs-poc-eg8ozwut8ajxewx5eqbdsjg.firebasestorage.app",
  messagingSenderId: "851724091652",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-aquitplatform-60f030cc-6959-4bfe-b4b0-bfa86c2a9b1d");
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
