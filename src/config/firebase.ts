import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDEm63pwqxbOPthMD9pzg9xADwMrtwLltc",
  authDomain: "bulkos.firebaseapp.com",
  projectId: "bulkos",
  storageBucket: "bulkos.appspot.com",
  messagingSenderId: "808077952073",
  appId: "1:808077952073:web:7212642bd3e091d90c6b98",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);