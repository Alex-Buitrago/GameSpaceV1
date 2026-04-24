import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyApqvpYtdr09xaakDG4HhIsAtwxxnyT_y0",
  authDomain: "spacegame-f4c6b.firebaseapp.com",
  projectId: "spacegame-f4c6b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();