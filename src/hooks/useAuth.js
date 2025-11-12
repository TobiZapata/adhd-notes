"use client";
import {
  useState,
  useEffect,
} from "react";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] =
    useState(null);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (firebaseUser) => {
          setUser(firebaseUser || null);
          setLoading(false);
        }
      );
    return () => unsubscribe();
  }, []);

  // 👇 Nueva función para cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null); // opcional, porque onAuthStateChanged también lo actualiza
    } catch (error) {
      console.error(
        "Error al cerrar sesión:",
        error
      );
    }
  };

  return { user, loading, logout }; // 👈 devolvemos logout también
}
