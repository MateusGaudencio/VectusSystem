import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import  { getFirestore } from 'firebase/firestore'
import  { getStorage } from 'firebase/storage'



const firebaseConfig = {
  apiKey: "AIzaSyAe_xysFMQ-_ZvewbwelXSAOKgQaumiqn8",
  authDomain: "vectussystem.firebaseapp.com",
  projectId: "vectussystem",
  storageBucket: "vectussystem.appspot.com",
  messagingSenderId: "1092331693305",
  appId: "1:1092331693305:web:6a5c97314e686c6ea3ee28",
  measurementId: "G-827GMKJM04"
};

  const firebaseApp = initializeApp(firebaseConfig);
  const  auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);
  export { auth, db, storage };
