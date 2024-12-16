import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import  { getFirestore } from 'firebase/firestore'
import  { getStorage } from 'firebase/storage'



const firebaseConfig = {
  apiKey: "AIzaSyCQ0I_gvzCRivCRis-0o5KJARyRUsW8M0U",
  authDomain: "vectussystem-test.firebaseapp.com",
  projectId: "vectussystem-test",
  storageBucket: "vectussystem-test.appspot.com",
  messagingSenderId: "674362033526",
  appId: "1:674362033526:web:36679c314a76be4f8fe657",
  measurementId: "G-74W3NBRYYS"
};

  const firebaseApp = initializeApp(firebaseConfig);
  const  auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);
  export { auth, db, storage };
