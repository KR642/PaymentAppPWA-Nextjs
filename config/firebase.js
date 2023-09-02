// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFhOGhJ8Lq8uBv9hXzLIp8sC4FhwsuDbc",
  authDomain: "pwa-cs-mdx.firebaseapp.com",
  projectId: "pwa-cs-mdx",
  storageBucket: "pwa-cs-mdx.appspot.com",
  messagingSenderId: "466737548457",
  appId: "1:466737548457:web:daa1687d1fbc1872fa2db8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;