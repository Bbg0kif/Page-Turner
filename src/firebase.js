import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBid-fB_ZhF_kJcNvdkotkn52M28lDCixc",
  authDomain: "page-turner-b4d10.firebaseapp.com",
  projectId: "page-turner-b4d10",
  storageBucket: "page-turner-b4d10.firebasestorage.app",
  messagingSenderId: "825511014228",
  appId: "1:825511014228:web:fc8c18b20b08815f4ce2c1",
  measurementId: "G-ZD5GNL7SJK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);