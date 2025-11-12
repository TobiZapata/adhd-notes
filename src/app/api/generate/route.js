import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Falta el prompt" },
        { status: 400 }
      );
    }

    // 🔧 Prompt para que responda SIEMPRE en JSON
    const systemPrompt = `
      Sos un asistente que ayuda a personas con TDAH a organizar su día en hasta 3 bloques.
      Respondé SIEMPRE en formato JSON válido, con una lista de tarjetas.
      Cada tarjeta deberá tener en el "title": su titulo seguido del rango de horarios en el que se realizara.
      Cada tarjeta debe tener: "title", "description" y "color" (ej: "blue", "green", "yellow").
      Estructura esperada:
      {
        "message": "breve explicación general para el usuario",
        "blocks": [
          {
            "name": "nombre del bloque (ej. Mañana productiva)",
            "cards": [
              { "title": "...", "description": "...", "color": "blue" }
            ]
          }
        ]
      }

      Cada bloque representa una parte del día o tema general.
      Cada tarjeta pertenece a un bloque.

      Ahora generá tarjetas según la siguiente petición del usuario:
      "${prompt}"
    `;

    // 🚀 Generamos el contenido con el nuevo SDK
    const result =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt },
            ],
          },
        ],
      });

    // ✅ Acceso seguro al texto devuelto
    const text =
      result?.response?.candidates?.[0]
        ?.content?.parts?.[0]?.text ||
      result?.response?.text ||
      result?.candidates?.[0]?.content
        ?.parts?.[0]?.text ||
      "";

    // 🧹 Limpieza: eliminamos ```json y ```
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 🔍 Intentamos parsear JSON
    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (err) {
      console.error(
        "❌ Error al parsear JSON:",
        err
      );
      data = {
        error:
          "La IA no devolvió JSON válido",
        raw: cleanText,
      };
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Error en /api/generate:",
      error
    );
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
