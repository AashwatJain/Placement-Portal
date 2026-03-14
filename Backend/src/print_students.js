import admin from "firebase-admin";
import fs from "fs";

// Initialize Firebase
const serviceAccount = JSON.parse(fs.readFileSync("./config/serviceAccountKey.json", "utf8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://placement-portal-75051-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();
db.ref("users").once("value").then(snapshot => {
  const data = snapshot.val();
  const students = Object.values(data).filter(u => u.role === "student");
  console.log(JSON.stringify(students.slice(0, 2), null, 2));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
