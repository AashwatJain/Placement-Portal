import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("./config/serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://placement-portal-c0bdf-default-rtdb.firebaseio.com",
    storageBucket: "placement-portal-c0bdf.appspot.com",
  });
}

async function testFetch() {
    try {
        const companyName = "Microsoft";
        const firestore = admin.firestore();
        
        let query = firestore.collection("opportunities");
        
        if (companyName) {
            query = query.where("name", "==", companyName);
        }
        
        const snapshot = await query.get();
        let jafs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log("Fetched JAFs count:", jafs.length);

        // Sort in memory
        jafs.sort((a, b) => {
            const timeA = a.createdAt ? (typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : new Date(a.createdAt).getTime()) : 0;
            const timeB = b.createdAt ? (typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : new Date(b.createdAt).getTime()) : 0;
            return timeB - timeA;
        });

        console.log("Successfully sorted JAFs.");
        console.log("Sample JAF:", JSON.stringify(jafs[0], null, 2));
    } catch (error) {
        console.error("Error fetching JAFs:", error);
    }
}

testFetch();
