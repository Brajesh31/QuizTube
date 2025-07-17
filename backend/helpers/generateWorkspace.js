import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateWorkspace(subtitles, type, count) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  // Limit subtitles to ~100,000 characters to be safe
  const truncatedSubtitles = subtitles.length > 100000 
    ? subtitles.substring(0, 100000)
    : subtitles;

  let prompt;
  
  switch(type) {
    case 'mcq':
      prompt = `Create ${count} multiple choice questions based on the following content. 
Each question should have one correct answer and three incorrect answers.
IMPORTANT: Respond ONLY with a valid JSON object. No markdown, no explanations, just the JSON.
Format: {
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": ["Paris", "London", "Berlin", "Madrid"],
      "correctIndex": 0
    }
  ]
}
Content: ${truncatedSubtitles}`;
      break;
    case 'summarize':
      prompt = `Summarize the following content in approximately ${count} words.
IMPORTANT: Respond ONLY with a valid JSON object. No markdown, no explanations, just the JSON.
Format: {
  "summary": "The content discusses..."
}
Content: ${truncatedSubtitles}`;
      break;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Remove any markdown code block markers and surrounding whitespace
    text = text.replace(/^(\s*```\s*json\s*|\s*```\s*|\s*```javascript\s*)/i, '');
    text = text.replace(/\s*```\s*$/g, '');
    text = text.trim();

    // Ensure the text starts with { and ends with }
    if (!text.startsWith('{') || !text.endsWith('}')) {
      throw new Error('Response is not a valid JSON object');
    }

    try {
      const parsed = JSON.parse(text);
      
      // Validate the structure based on type
      if (type === 'mcq' && (!parsed.questions || !Array.isArray(parsed.questions))) {
        throw new Error('Invalid MCQ response structure');
      }
      if (type === 'summarize' && typeof parsed.summary !== 'string') {
        throw new Error('Invalid summary response structure');
      }
      
      return parsed;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Response:', text);
      throw new Error('Failed to parse AI response as JSON');
    }
  } catch (error) {
    console.error('Workspace Generation Error:', error);
    throw error;
  }
}
