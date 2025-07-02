import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase baseada no google-services.json
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyClqecbPG5pQLLgT4EHixAhTomFEcg0pm0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "acessivel-mobility.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "acessivel-mobility",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "acessivel-mobility.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1014982351413",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1014982351413:web:f4b3afebbd908e32ab2f7c"
};

console.log('🔧 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey.substring(0, 10) + '...'
});

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// Inicializar Authentication
export const auth = getAuth(app);

export default app;