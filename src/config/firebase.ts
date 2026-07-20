import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
} from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Capacitor } from "@capacitor/core";

const firebaseConfig = {
  apiKey: "AIzaSyDEm63pwqxbOPthMD9pzg9xADwMrtwLltc",
  authDomain: "bulkos.firebaseapp.com",
  projectId: "bulkos",
  storageBucket: "bulkos.appspot.com",
  messagingSenderId: "808077952073",
  appId: "1:808077952073:web:7212642bd3e091d90c6b98",
};

export const app = initializeApp(firebaseConfig);

// In the native WKWebView, getAuth()'s default persistence/popup machinery
// doesn't work — the sign-in REST call succeeds but the SDK never settles.
// The documented Capacitor fix is explicit indexedDB persistence.
export const auth = Capacitor.isNativePlatform()
  ? initializeAuth(app, { persistence: indexedDBLocalPersistence })
  : getAuth(app);

// Firestore's default streaming transport (WebChannel) hangs inside the
// native iOS WKWebView — requests never resolve, so every read spins
// forever in the Capacitor app while working fine in desktop Safari.
// Force long polling on native; keep auto-detection in regular browsers.
export const db = initializeFirestore(
  app,
  Capacitor.isNativePlatform()
    ? { experimentalForceLongPolling: true }
    : { experimentalAutoDetectLongPolling: true }
);

export const storage = getStorage(app);