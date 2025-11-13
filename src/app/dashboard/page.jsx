"use client";
import {
  useState,
  useEffect,
} from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import CardList from "@/components/CardList";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [input, setInput] =
    useState("");
  const [data, setData] = useState({
    cards: [],
    blocks: [],
    messages: [],
  });
  const [loading, setLoading] =
    useState(false);
  const [saving, setSaving] =
    useState(false);

  // 🆕 Modal + título
  const [
    showTitleModal,
    setShowTitleModal,
  ] = useState(false);
  const [setTitle, setSetTitle] =
    useState("");

  // 👂 Escucha en tiempo real el documento del usuario
  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(
      db,
      "users",
      user.uid
    );
    console.log(
      "📡 Escuchando cambios de:",
      user.uid
    );

    const unsubscribe = onSnapshot(
      userRef,
      async (snap) => {
        if (snap.exists()) {
          const firestoreData =
            snap.data();
          console.log(
            "🔄 Snapshot actualizado:",
            firestoreData
          );

          const normalizedBlocks = (
            firestoreData.blocks || []
          ).map((b) => ({
            ...b,
            cards: b.cards || [],
          }));

          setData({
            cards:
              firestoreData.cards || [],
            blocks: normalizedBlocks,
            messages:
              firestoreData.messages ||
              [],
          });
        } else {
          console.log(
            "⚠️ Documento inexistente. Creando uno nuevo..."
          );
          await setDoc(userRef, {
            cards: [],
            blocks: [],
            messages: [],
          });
        }
      },
      (error) =>
        console.error(
          "❌ Error en onSnapshot:",
          error
        )
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // ✉️ Enviar prompt al backend
  const sendPrompt = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user?.uid)
      return;

    const newUserMessage = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    const updatedMessages = [
      ...data.messages,
      newUserMessage,
    ].slice(-8);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            prompt: input,
            messages: updatedMessages,
          }),
        }
      );

      const responseData =
        await res.json();
      console.log(
        "📦 Respuesta del backend:",
        responseData
      );

      const newAssistantMessage = {
        role: "assistant",
        content:
          responseData.message ||
          "Listo.",
        timestamp: Date.now(),
      };

      const newMessages = [
        ...updatedMessages,
        newAssistantMessage,
      ].slice(-8);

      const newBlocks = (
        responseData.blocks || []
      ).map((block) => ({
        ...block,
        cards: block.cards || [],
      }));

      const newCards =
        newBlocks.flatMap((block) =>
          (block.cards || []).map(
            (card) => ({
              ...card,
              block: block.name,
            })
          )
        );

      const userRef = doc(
        db,
        "users",
        user.uid
      );

      await updateDoc(userRef, {
        messages: newMessages,
        blocks: newBlocks,
        cards: newCards,
        updatedAt: Date.now(),
      });

      setData({
        messages: newMessages,
        blocks: newBlocks,
        cards: newCards,
      });
    } catch (err) {
      console.error(
        "❌ Error al conectar con la IA:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // 💾 Abrir modal para pedir título
  // 💾 Guardar set con límite de 10
  const saveCurrentSet = async () => {
    if (
      !user?.uid ||
      !data.blocks.length
    )
      return alert(
        "No hay tarjetas para guardar."
      );

    setSaving(true);
    try {
      const notesRef = collection(
        db,
        "users",
        user.uid,
        "notes"
      );

      // 1️⃣ Obtener cuántos sets existen actualmente
      const snapshot = await getDocs(
        notesRef
      );

      if (snapshot.size >= 10) {
        alert(
          "❌ Ya alcanzaste el máximo de 10 sets de notas."
        );
        setSaving(false);
        return;
      }

      // 2️⃣ Pedir título al usuario
      const title = prompt(
        "Ponle un título al set:"
      );
      if (!title || !title.trim()) {
        alert(
          "⚠️ Debes poner un título válido."
        );
        setSaving(false);
        return;
      }

      // 3️⃣ Guardar set
      await addDoc(notesRef, {
        name: title.trim(),
        blocks: data.blocks,
        cards: data.cards,
        createdAt: Date.now(),
      });

      alert(
        "✅ Set guardado correctamente"
      );
    } catch (err) {
      console.error(
        "❌ Error al guardar el set:",
        err
      );
      alert(
        "Hubo un error al guardar el set."
      );
    } finally {
      setSaving(false);
    }
  };

  // 🔥 Guardar set con su título
  const confirmSaveSet = async () => {
    if (!setTitle.trim())
      return alert(
        "Poné un título para el set."
      );

    setSaving(true);
    try {
      const notesRef = collection(
        db,
        "users",
        user.uid,
        "notes"
      );

      await addDoc(notesRef, {
        name: setTitle.trim(),
        blocks: data.blocks,
        cards: data.cards,
        createdAt: Date.now(),
      });

      setShowTitleModal(false);
      setSetTitle("");
      alert(
        "✅ Set guardado correctamente"
      );
    } catch (err) {
      console.error(
        "❌ Error al guardar el set:",
        err
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <main className="flex h-screen">
        {/* 🧠 Chat IA */}
        <section className="w-1/2 p-6 bg-gray-900 text-white flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Asistente IA
            </h1>
            <div className="flex gap-2">
              <Link
                href="/mynotes"
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md transition"
              >
                Mis sets
              </Link>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-800 rounded p-3 mb-3">
            {data.messages.map(
              (m, i) => (
                <div
                  key={i}
                  className={`mb-2 p-2 rounded ${
                    m.role === "user"
                      ? "bg-blue-600 ml-auto w-fit"
                      : "bg-gray-700"
                  }`}
                >
                  {m.content}
                </div>
              )
            )}
          </div>

          <form
            onSubmit={sendPrompt}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              placeholder="Escribe tu prompt..."
              className="flex-1 p-2 rounded text-black"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              {loading
                ? "Pensando..."
                : "Enviar"}
            </button>
          </form>
        </section>

        {/* 🗂️ Tarjetas */}
        <section className="w-1/2 p-6 bg-gray-100 text-gray-900 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Tus tarjetas
            </h2>
            <button
              onClick={saveCurrentSet}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md transition"
            >
              {saving
                ? "Guardando..."
                : "💾 Guardar set"}
            </button>
          </div>

          {!data.blocks.length ? (
            <p className="text-gray-600">
              Esperando tarjetas...
            </p>
          ) : (
            <div className="space-y-6">
              {data.blocks.map(
                (block, i) => (
                  <div key={i}>
                    <h3 className="text-lg font-bold mb-2">
                      {block.name}
                    </h3>
                    <CardList
                      cards={
                        block.cards ??
                        []
                      }
                    />
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>

      {/* 🆕 MODAL PARA TÍTULO DEL SET */}
      {showTitleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-bold mb-3">
              Título del set
            </h2>

            <input
              className="w-full border p-2 rounded mb-4"
              value={setTitle}
              onChange={(e) =>
                setSetTitle(
                  e.target.value
                )
              }
              placeholder="Ej: Rutina de estudio del lunes"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() =>
                  setShowTitleModal(
                    false
                  )
                }
                className="px-3 py-1 bg-gray-400 rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSaveSet}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
