import admin from "firebase-admin";
import 'dotenv/config';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    databaseURL: "https://placement-portal-c0bdf-default-rtdb.firebaseio.com",
    storageBucket: "placement-portal-c0bdf.appspot.com"
  });
}

const db = admin.database();
export default db;