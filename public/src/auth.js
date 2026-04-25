import { db } from "./firebase.js";
import {
  doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Convert email to a safe Firestore document ID
function emailToKey(email) {
  return email.toLowerCase().trim()
    .replace(/[@.]/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "");
}

export async function login(email, password) {
  const key  = emailToKey(email);
  const ref  = doc(db, "users", key);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Usuario no encontrado");

  const data = snap.data();
  if (data.password !== password) throw new Error("Contraseña incorrecta");

  const user = { email: data.email };
  localStorage.setItem("user", JSON.stringify(user));
  window.location.href = "/game.html";
}

export async function register(email, password) {
  const normalEmail = email.toLowerCase().trim();
  const key  = emailToKey(normalEmail);
  const ref  = doc(db, "users", key);
  const snap = await getDoc(ref);

  if (snap.exists()) throw new Error("Usuario ya existe");

  await setDoc(ref, { email: normalEmail, password });
}

export function checkAuth() {
  const raw = localStorage.getItem("user");
  if (!raw) {
    window.location.href = "/login.html";
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    window.location.href = "/login.html";
    return null;
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}
