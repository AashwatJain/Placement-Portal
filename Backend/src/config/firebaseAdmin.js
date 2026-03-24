import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Use the environment variable from Render
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Use the local file for development
  serviceAccount = require("./serviceAccountKey.json");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://placement-portal-c0bdf-default-rtdb.firebaseio.com",
    storageBucket: "placement-portal-c0bdf.firebasestorage.app"
  });
}

const db = admin.database();
export default db;