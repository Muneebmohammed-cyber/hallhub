// Paste your Firebase web app config here (Firebase console → Project settings → Your apps → Web app).
// While apiKey is empty, the app runs in DEMO MODE: everything works, but data stays in this browser.
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

export const DEMO_MODE = !firebaseConfig.apiKey;
