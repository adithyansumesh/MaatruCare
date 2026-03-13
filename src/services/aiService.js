const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are MaatruCare AI, a compassionate and knowledgeable maternity health assistant. You provide evidence-based guidance for pregnant women. You should:
- Be warm, empathetic, and supportive
- Provide medically accurate information
- Always recommend consulting a healthcare provider for serious concerns
- Personalize responses based on the user's pregnancy stage and conditions
- Be concise but thorough
- Use simple language that's easy to understand`;

const FEATURE_PROMPTS = {
  'ai-assistant': 'You are a general pregnancy assistant. Help with any pregnancy-related questions.',
  'diet-lifestyle': 'You are a pregnancy nutrition and lifestyle expert. Provide safe food recommendations, meal plans, and healthy lifestyle tips for pregnant women.',
  'hydration': 'You are a hydration specialist for pregnant women. Advise on water intake, healthy beverages, and signs of dehydration during pregnancy.',
  'symptoms': 'You are a pregnancy symptom analyst. Help identify symptoms, explain what is normal, and advise when to seek medical attention.',
  'mood': 'You are an emotional wellness counselor for pregnant women. Help with mood swings, anxiety, and emotional well-being during pregnancy.',
  'emergency': 'You are an emergency pregnancy advisor. Help assess urgent situations and provide immediate guidance.',
  'risk-awareness': 'You are a pregnancy risk awareness expert. Educate about risk factors, warning signs, and preventive measures.',
  'appointments': 'You are a pregnancy appointment scheduler. Help manage doctor visits and check-up schedules.',
  'voice': 'You are a pregnancy assistant responding to voice queries. Be conversational and clear.',
  'reminders': 'You help manage pregnancy-related reminders for medicine, hydration, exercise, and appointments.',
};

export async function generateAIResponse(feature, userData, history = [], userMessage) {
  const featurePrompt = FEATURE_PROMPTS[feature] || FEATURE_PROMPTS['ai-assistant'];
  
  const userContext = userData
    ? `\nUser info: Name: ${userData.name || 'User'}, Pregnancy week: ${userData.weeks || 'unknown'}, Conditions: ${userData.conditions || 'none'}.`
    : '';

  const messages = [
    {
      role: 'system',
      content: `${SYSTEM_PROMPT}\n\n${featurePrompt}${userContext}`
    },
    ...history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content
    })),
    {
      role: 'user',
      content: userMessage
    }
  ];

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MaatruCare',
      },
      body: JSON.stringify({
        model: 'openrouter/quill-v1',
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API error:', response.status, errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }

    throw new Error('No response content');
  } catch (error) {
    console.error('AI Service error:', error);
    throw error;
  }
}
