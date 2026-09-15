import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCSHTxZOybi39MhJwPU7U14t6YOUpNTfmM",
    authDomain: "school-management-system-4a276.firebaseapp.com",
    projectId: "school-management-system-4a276",
    storageBucket: "school-management-system-4a276.firebasestorage.app",
    messagingSenderId: "261215378875",
    appId: "1:261215378875:web:c1644937e223478608389e",
    measurementId: "G-DDJKYKLKWQ"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export {
    app,
    auth,
    db
};