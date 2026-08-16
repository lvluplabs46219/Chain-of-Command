import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the Firebase Admin SDK if not already initialized
if (getApps().length === 0) {
  // Try to initialize using application default credentials (ADC) or a service account key path
  try {
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'cs-poc-eg8ozwut8ajxewx5eqbdsjg',
    });
    console.log('Firebase Admin initialized successfully.');
  } catch (err) {
    console.warn('Failed to initialize Firebase Admin. Please check your credentials.', err);
  }
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
