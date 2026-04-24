import { db } from "./firebase.js";
import { doc, setDoc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function saveGame(uid, data) {
  await setDoc(doc(db, "players", uid), data);
}

export async function loadGame(uid) {
  const docRef = doc(db, "players", uid);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return snap.data();
  } else {
    return null;
  }
}