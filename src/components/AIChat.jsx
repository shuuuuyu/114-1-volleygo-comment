import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

export default function AIChat() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    
    try {
      const response = await fetch('https://one14-1-volleygo-api.onrender.com/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAnswer(data.answer);
      
    } catch (error) {
      console.error('API Error:', error);
      setAnswer('抱歉，AI 暫時無法回答：' + error.message);
    }
    
    setLoading(false);
    setQuestion('');
  };

  return (
    <div className="bg-white p-6 shadow-lg border-t border-b">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-purple-500" />
        <h3 className="font-bold text-gray-800">🏐 排球規則小助手</h3>
      </div>
      
      <div className="flex gap-3 mb-3">
        <input
          type="text"
          placeholder="問排球規則相關問題..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && askAI()}
          className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <button
          onClick={askAI}
          disabled={loading || !question.trim()}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:bg-gray-300"
        >
          {loading ? '...' : <Send size={20} />}
        </button>
      </div>
      
      {answer && (
        <div className="bg-purple-50 rounded-lg p-4 text-gray-700">
          <p className="font-semibold text-purple-700 mb-2">💡 AI 回答：</p>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}