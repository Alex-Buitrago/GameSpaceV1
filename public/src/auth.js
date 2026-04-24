import { auth, provider } from "./firebase.js";
import { 
  signInWithPopup,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export async function loginWithGoogle() {
  await signInWithPopup(auth, provider);
}

export function checkAuth() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = "/game.html";
    } else {
      localStorage.removeItem("user");
    }
  });
}