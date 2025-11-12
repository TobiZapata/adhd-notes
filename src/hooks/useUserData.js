import {
  useEffect,
  useState,
} from "react";
import {
  getUserData,
  updateUserData,
  createUserData,
} from "@/lib/userData";
import { useAuth } from "./useAuth";

export function useUserData() {
  const { user } = useAuth();
  const [messages, setMessages] =
    useState([]);
  const [cards, setCards] = useState(
    []
  );
  const [loadingData, setLoadingData] =
    useState(true);

  // 🔹 Cargar datos cuando el usuario inicia sesión
  useEffect(() => {
    if (!user) return;
    (async () => {
      await createUserData(user.uid);
      const data = await getUserData(
        user.uid
      );
      setMessages(data.messages || []);
      setCards(data.cards || []);
      setLoadingData(false);
    })();
  }, [user]);

  // 🔹 Guardar en Firestore cada vez que cambien
  useEffect(() => {
    if (!user || loadingData) return;
    updateUserData(user.uid, {
      messages,
      cards,
    });
  }, [messages, cards]);

  return {
    messages,
    setMessages,
    cards,
    setCards,
    loadingData,
  };
}
