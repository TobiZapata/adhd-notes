"use client";
import { useState } from "react";
import CardList from "@/components/CardList";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { logout } = useAuth();
  const [input, setInput] =
    useState("");
  const [blocks, setBlocks] = useState(
    []
  );
  const [message, setMessage] =
    useState(""); // 🆕 mensaje del chat
  const [loading, setLoading] =
    useState(false);

  const sendPrompt = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBlocks([]);
    setMessage("");

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
          }),
        }
      );

      const data = await res.json();
      console.log(
        "📦 Respuesta del backend:",
        data
      );

      if (data.message)
        setMessage(data.message);
      if (data.blocks)
        setBlocks(data.blocks);
    } catch (err) {
      console.error(
        "Error al conectar con la IA:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <main className="flex h-screen">
        {/* 🧠 Chat IA */}
        <section className="w-1/2 p-6 bg-gray-700 text-white flex flex-col">
          <h1 className="text-2xl font-bold mb-4">
            Asistente IA
          </h1>

          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 w-40 py-1 rounded-md transition mb-4"
          >
            Cerrar sesión
          </button>

          <form
            onSubmit={sendPrompt}
            className="flex gap-2 mb-4"
          >
            <input
              type="text"
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              placeholder="Ej: organizame el día con 3 tareas importantes"
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

          {/* 🗨️ Respuesta del asistente */}
          {message && (
            <div className="bg-gray-500 rounded-md p-4 mt-4 text-gray-200">
              <p>{message}</p>
            </div>
          )}
        </section>

        {/* 🗂️ Bloques y tarjetas */}
        <section className="w-1/2 p-6 bg-gray-100 text-gray-900 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">
            Tus tarjetas
          </h2>

          {blocks.length === 0 ? (
            <p className="text-gray-600">
              Esperando tarjetas...
            </p>
          ) : (
            <div className="space-y-8">
              {blocks.map(
                (block, i) => (
                  <div key={i}>
                    <h3 className="text-lg font-bold mb-2 border-b border-gray-300 pb-1">
                      {block.title}
                    </h3>
                    <CardList
                      cards={
                        block.cards
                      }
                    />
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </AuthGuard>
  );
}
