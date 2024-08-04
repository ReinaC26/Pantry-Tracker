import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import auth functions

const firebaseConfig = {
  apiKey: "AIzaSyAae89yDDkxkUyMfZXTjUTSwbYJe8gXU3Q",
  authDomain: "pantry-tracker-project-69ca5.firebaseapp.com",
  projectId: "pantry-tracker-project-69ca5",
  storageBucket: "pantry-tracker-project-69ca5.appspot.com",
  messagingSenderId: "271003580599",
  appId: "1:271003580599:web:2cb98357a367df04197532",
  measurementId: "G-18MMZP6V4H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app); // Initialize auth

export { firestore, auth };