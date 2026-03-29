import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `Eres "Velox Brain", el cerebro analítico de la plataforma logística Velox en Colombia. 
Tu objetivo es ayudar al usuario a aumentar sus GANANCIAS y EFICIENCIA operacional. 

Reglas de respuesta:
1. Sé conciso y asertivo. Usa terminología logística colombiana (fletes, recolecciones, placa, NIT, etc.).
2. Analiza los datos proporcionados (pedidos, ciudades, repartidores) para dar sugerencias de negocio.
3. Si el usuario pregunta cosas fuera de logística, responde con humor profesional indicando que tu foco es la rentabilidad de Velox.
4. Sugiere siempre formas de ahorrar combustible o tiempo de entrega.
5. Formatea tus respuestas con Markdown elegante para una UI moderna.`;

// Usamos el nombre del recurso completo para evitar errores de mapeo 404
export const model = genAI.getGenerativeModel({ 
  model: "models/gemini-1.5-flash"
});

export async function getLogisticsInsight(data: any) {
  const prompt = `Contexto: ${SYSTEM_PROMPT}\n\nAnaliza estos datos operativos y dame 3 consejos clave: ${JSON.stringify(data)}`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Velox Brain Error:", error);
    return "Módulo de inteligencia en mantenimiento temporal. Sincronizando satélites...";
  }
}

export async function chatWithBrain(history: any[], message: string, data: any) {
  const chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 500,
    },
  });

  const prompt = `Contexto operacional actual: ${JSON.stringify(data)}. \n\n${SYSTEM_PROMPT}\n\nPregunta del usuario: ${message}`;
  
  try {
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Velox Chat Error:", error);
    return "Error de enlace neuronal. Reintenta en unos segundos.";
  }
}
