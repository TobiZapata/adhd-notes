"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthGuard from "@/components/AuthGuard"; // 🧱 Importamos el guard

export default function LoginPage() {
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [
    modoRegistro,
    setModoRegistro,
  ] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modoRegistro) {
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        alert(
          "Cuenta creada con éxito ✅"
        );
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        alert(
          "Inicio de sesión exitoso 👋"
        );
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleLogin =
    async () => {
      try {
        const provider =
          new GoogleAuthProvider();
        await signInWithPopup(
          auth,
          provider
        );
        alert(
          "Inicio de sesión con Google exitoso 🚀"
        );
      } catch (error) {
        alert(error.message);
      }
    };

  return (
    <AuthGuard requireAuth={false}>
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-8 rounded-2xl shadow-md flex flex-col gap-4 w-80"
        >
          <h1 className="text-2xl font-semibold text-center text-white">
            {modoRegistro
              ? "Crear cuenta"
              : "Iniciar sesión"}
          </h1>

          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="border p-2 rounded"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            required
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded py-2 transition"
          >
            {modoRegistro
              ? "Registrarse"
              : "Entrar"}
          </button>

          <div className="text-center text-gray-400 my-2">
            o
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="bg-red-500 hover:bg-red-600 text-white rounded py-2 transition flex items-center justify-center gap-2"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Iniciar con Google
          </button>

          <p
            className="text-sm text-center text-gray-400 cursor-pointer hover:underline"
            onClick={() =>
              setModoRegistro(
                !modoRegistro
              )
            }
          >
            {modoRegistro
              ? "¿Ya tenés cuenta? Iniciá sesión"
              : "¿No tenés cuenta? Registrate"}
          </p>
        </form>
      </main>
    </AuthGuard>
  );
}
