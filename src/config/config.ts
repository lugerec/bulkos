import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDEm63pwqxbOPthMD9pzg9xADwMrtwLltc",
  authDomain: "bulkos.firebaseapp.com",
  projectId: "bulkos",
  storageBucket: "bulkos.firebasestorage.app",
  messagingSenderId: "808077952073",
  appId: "1:808077952073:web:7212642bd3e091d90c6b98",
};

export const app = initializeApp(firebaseConfig);