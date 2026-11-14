
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDynnhVlFlPSyXVzexl_uDe5F-b5kiKxQU",
  authDomain: "taskflow-nosql.firebaseapp.com",
  projectId: "taskflow-nosql",
  storageBucket: "taskflow-nosql.firebasestorage.app",
  messagingSenderId: "26082702802",
  appId: "1:26082702802:web:7dd913d6fd97805305c40b",
  measurementId: "G-5HL37XCWPC"
};

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
