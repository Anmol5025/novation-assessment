const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

const analyzeDocument = async (documentText, documentTitle) => {
  if (!openai) {
    console.warn('OpenAI API key not configured');
    return {
      summary: 'AI analysis unavailable. Please configure OPENAI_API_KEY.',
      keyTerms: [],
      parties: [],
      obligations: [],
      risks: [],
      deadlines: []
    };
  }

  try {
    const prompt = `Analyze this legal document titled "${documentTitle}". Provide:
1. A brief summary (2-3 sentences)
2. Key terms and definitions (list up to 5)
3. Parties involved (list all mentioned parties)
4. Obligations and responsibilities (list main obligations)
5. Potential risks or concerns (list up to 3)
6. Important deadlines or dates (extract any dates mentioned)

Document text:
${documentText.substring(0, 4000)}

Respond in JSON format:
{
  "summary": "...",
  "keyTerms": ["term1", "term2"],
  "parties": ["party1", "party2"],
  "obligations": ["obligation1", "obligation2"],
  "risks": ["risk1", "risk2"],
  "deadlines": [{"title": "deadline1", "date": "YYYY-MM-DD"}]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a legal document analysis assistant. Provide accurate, structured analysis of legal documents.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      summary: 'Analysis completed',
      keyTerms: [],
      parties: [],
      obligations: [],
      risks: [],
      deadlines: []
    };
  } catch (error) {
    console.error('AI Analysis Error:', error.message);
    return {
      summary: 'AI analysis unavailable. Please check API configuration.',
      keyTerms: [],
      parties: [],
      obligations: [],
      risks: [],
      deadlines: []
    };
  }
};

module.exports = { analyzeDocument };
