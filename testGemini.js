import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

async function main() {
  try {
    // ⚠️ Pasamos explícitamente la API key
    const ai = new GoogleGenAI({
      apiKey:
        process.env.GEMINI_API_KEY,
    });

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents:
          "devuelve en formato json una lista de tres tareas diarias para una persona con TDAH que tiene que estudiar programacion y quiere organizar su dia, ejemplo del json: {'cards':[{'title':'Estudiar C++','description':'Repasar punteros y estructuras','color':'blue'},{'title':'Hacer ejercicio','description':'Salir a caminar 30 minutos','color':'green'}]}",
      });

    console.log(
      "🔍 Estructura completa de la respuesta:"
    );
    console.dir(response, {
      depth: null,
    });

    const text =
      response?.response
        ?.candidates?.[0]?.content
        ?.parts?.[0]?.text ||
      response?.response?.output_text ||
      response?.text ||
      "No se encontró texto";

    console.log(
      "\n✅ Texto del modelo:"
    );
    console.log(text);
  } catch (err) {
    console.error(
      "❌ Error al usar Gemini:",
      err
    );
  }
}

main();
