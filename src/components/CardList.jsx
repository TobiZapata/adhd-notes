"use client";
import {
  useState,
  useEffect,
} from "react";

export default function CardList({
  cards,
}) {
  const [
    editableCards,
    setEditableCards,
  ] = useState(cards);

  // 🔄 Se actualiza cuando Dashboard recibe nuevas tarjetas
  useEffect(() => {
    setEditableCards(cards);
  }, [cards]);

  const handleEdit = (index) => {
    const updated = [...editableCards];
    updated[index].isEditing = true;
    setEditableCards(updated);
  };

  const handleCancel = (index) => {
    const updated = [...editableCards];
    updated[index].isEditing = false;
    setEditableCards(updated);
  };

  const handleSave = (
    index,
    newTitle,
    newDescription
  ) => {
    const updated = [...editableCards];
    updated[index].title = newTitle;
    updated[index].description =
      newDescription;
    updated[index].isEditing = false;
    setEditableCards(updated);
  };

  const colorMap = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    yellow: "bg-yellow-600",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {editableCards.map((card, i) => (
        <div
          key={i}
          className={`p-4 rounded-xl shadow ${
            colorMap[card?.color] ||
            "bg-gray-300"
          }`}
        >
          {card.isEditing ? (
            <CardEditor
              card={card}
              onSave={(t, d) =>
                handleSave(i, t, d)
              }
              onCancel={() =>
                handleCancel(i)
              }
            />
          ) : (
            <>
              <h3 className="font-bold text-lg mb-2">
                {card.title}
              </h3>
              <p className="mb-3">
                {card.description}
              </p>
              <button
                onClick={() =>
                  handleEdit(i)
                }
                className="text-sm bg-white/30 px-3 py-1 rounded hover:bg-white/50 transition"
              >
                ✏️ Editar
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function CardEditor({
  card,
  onSave,
  onCancel,
}) {
  const [title, setTitle] = useState(
    card.title
  );
  const [description, setDescription] =
    useState(card.description);

  return (
    <div>
      <input
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        className="w-full p-2 border rounded mb-2 text-sm"
      />
      <textarea
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
        className="w-full p-2 border rounded mb-2 text-sm h-20"
      />
      <div className="flex gap-2">
        <button
          onClick={() =>
            onSave(title, description)
          }
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-400 rounded hover:bg-gray-500 text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
