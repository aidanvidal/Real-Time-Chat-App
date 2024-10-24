import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAWjWxW8LJduflJb9myUoA9dXtaWqEvdQs",
  authDomain: "real-time-chat-app-f504c.firebaseapp.com",
  projectId: "real-time-chat-app-f504c",
  storageBucket: "real-time-chat-app-f504c.appspot.com",
  messagingSenderId: "929042841307",
  appId: "1:929042841307:web:ccd71b433b8431c01856fe",
  measurementId: "G-5452JTSN8J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error(error);
});
export const storage = getStorage(app);
export const db = getFirestore(app);
