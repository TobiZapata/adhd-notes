"use client";
import {
  useEffect,
  useState,
} from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

export default function MyNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState(
    []
  );

  useEffect(() => {
    if (!user?.uid) return;
    const notesRef = collection(
      db,
      "users",
      user.uid,
      "notes"
    );
    const unsub = onSnapshot(
      notesRef,
      (snap) => {
        const list = snap.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );
        setNotes(list);
      }
    );
    return () => unsub();
  }, [user?.uid]);

  return (
    <AuthGuard requireAuth={true}>
      <main className="p-6 bg-gray-100 min-h-screen">
        <Link
          href="/dashboard"
          className="text-blue-600 underline mb-4 inline-block"
        >
          ← Volver al Dashboard
        </Link>
        <h1 className="text-2xl font-bold mb-4">
          Mis sets guardados
        </h1>

        {!notes.length ? (
          <p className="text-gray-600">
            No tenés sets guardados
            todavía.
          </p>
        ) : (
          <ul className="space-y-4">
            {notes.map((note) => (
              <li
                key={note.id}
                className="p-4 bg-white shadow rounded-md border border-gray-200 hover:bg-gray-50 transition"
              >
                <Link
                  href={`/mynotes/${note.id}`}
                  className="block hover:text-blue-600"
                >
                  <h2 className="font-semibold">
                    {note.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(
                      note.createdAt
                    ).toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AuthGuard>
  );
}
