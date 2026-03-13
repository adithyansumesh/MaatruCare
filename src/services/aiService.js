// OpenRouter API configuration
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Healer Alpha is a free, reliable model on OpenRouter
const MODEL = "openrouter/healer-alpha";

console.log("OpenRouter API Key loaded:", !!API_KEY);

// System prompt defining AI behaviour
const SYSTEM_PROMPT = `
You are MaatruCare AI, a compassionate maternity support assistant.

Your role is to help pregnant women with:
• pregnancy symptoms
• safe diet recommendations
• hydration reminders
• prenatal exercise advice
• emotional wellbeing support
• when to consult a doctor

Guidelines:
1. Provide medically safe guidance.
2. Avoid giving unsafe medical instructions.
3. If symptoms appear serious, recommend consulting a doctor.
4. Keep responses simple, supportive, and clear.
5. Always consider pregnancy stage when giving advice.
6. Keep your responses concise (under 200 words) unless more detail is specifically requested.
`;

// Feature-specific instructions
function getFeatureInstruction(feature) {
  switch (feature) {
    case "symptom-analysis":
    case "symptom":
      return "Analyze the symptoms carefully and suggest possible causes. If the symptom could be dangerous during pregnancy, advise seeing a doctor.";
    case "diet-lifestyle":
    case "food":
      return "Provide pregnancy-safe diet advice and nutrition tips. Avoid recommending unsafe foods.";
    case "mood-tracking":
    case "mood":
      return "Provide emotional support and mental wellness tips for pregnant mothers.";
    case "ai-assistant":
    case "assistant":
    default:
      return "Provide general pregnancy guidance.";
  }
}

// Main AI function — signature matches how AIAssistantModal calls it
export async function generateAIResponse(feature, userData = {}, history = [], userMessage = "") {
  try {
    if (!API_KEY) {
      throw new Error("OpenRouter API key missing. Add VITE_OPENROUTER_API_KEY to your .env file.");
    }

    // Build user context
    const userContext = `
User Name: ${userData.name || "Unknown"}
Pregnancy Week: ${userData.pregnancyWeek || "Unknown"}
Existing Conditions: ${userData.conditions || "None"}
Current Mood: ${userData.mood || "Unknown"}
`;

    const featureInstruction = getFeatureInstruction(feature);

    // Build messages array in OpenAI chat format
    const messages = [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nUser Information:\n${userContext}\n\nFeature Mode:\n${featureInstruction}`
      }
    ];

    // Add conversation history for context (last 10 messages to avoid token overflow)
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === "model" ? "assistant" : "user",
          content: msg.content
        });
      }
    }

    // Add the current user message
    messages.push({
      role: "user",
      content: userMessage
    });

    // Call OpenRouter API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "MaatruCare"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.4,
        top_p: 0.9,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error:", response.status, errorData);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No response content from AI");
    }

    return text;

  } catch (error) {
    console.error("AI Generation Error:", error);
    return "I am having trouble connecting right now. Please check your API key or network connection.";
  }
}