"use client";
import {
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import CardList from "@/components/CardList";
import Link from "next/link";

export default function NoteDetail() {
  const { user } = useAuth();
  const { noteId } = useParams();
  const [note, setNote] =
    useState(null);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!user?.uid || !noteId) return;

    const fetchNote = async () => {
      const noteRef = doc(
        db,
        "users",
        user.uid,
        "notes",
        noteId
      );
      const snap = await getDoc(
        noteRef
      );
      if (snap.exists()) {
        setNote(snap.data());
      }
      setLoading(false);
    };

    fetchNote();
  }, [user?.uid, noteId]);

  if (loading) {
    return (
      <p className="text-center mt-10">
        Cargando nota...
      </p>
    );
  }

  if (!note) {
    return (
      <p className="text-center mt-10">
        Nota no encontrada 🕵️‍♂️
        <br />
        <Link
          href="/mynotes"
          className="text-blue-600 underline"
        >
          Volver a mis notas
        </Link>
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        href="/mynotes"
        className="text-blue-600 underline mb-4 inline-block"
      >
        ← Volver a mis notas
      </Link>

      <h1 className="text-2xl text-center font-bold mb-6">
        {note.name.toUpperCase() ||
          "Set sin título"}
      </h1>

      {note.blocks?.length ? (
        note.blocks.map((block, i) => (
          <div key={i} className="mb-8">
            <h2 className="text-xl font-semibold mb-3">
              {block.name}
            </h2>
            <CardList
              cards={block.cards || []}
            />
          </div>
        ))
      ) : (
        <p className="text-gray-500">
          No hay tarjetas en este set.
        </p>
      )}
    </div>
  );
}
