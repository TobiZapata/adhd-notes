// lib/userData.js
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase"; // Asegurate que exportes db en tu config

// 🔹 Crea el documento del usuario si no existe
export async function createUserData(
  uid
) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      messages: [],
      cards: [],
    });
  }
}

// 🔹 Obtiene los datos del usuario
export async function getUserData(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) return snap.data();
  return { messages: [], cards: [] };
}

// 🔹 Actualiza mensajes y/o tarjetas
export async function updateUserData(
  uid,
  data
) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
}
