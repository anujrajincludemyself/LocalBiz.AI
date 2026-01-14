import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import aiApi from '../services/aiApi';
import { showError } from '../utils/toast';

const AIAssistant = () => {
    const [messages, setMessages] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const response = await aiApi.getSuggestions();
                setSuggestions(response.suggestions || []);
            } catch (error) {
                console.error('Failed to load suggestions:', error);
            }
        };

        fetchSuggestions();
    }, []);

    // Ask AI
    const handleAsk = async (question) => {
        const queryText = question || query;
        if (!queryText.trim()) return;

        // Add user message
        const userMessage = { role: 'user', content: queryText };
        setMessages(prev => [...prev, userMessage]);
        setQuery('');
        setLoading(true);

        try {
            const response = await aiApi.askAI(queryText);

            // Add AI response
            const aiMessage = {
                role: 'assistant',
                content: response.response || 'No response from AI'
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            showError(error.message || 'Failed to get AI response');

            // Add error message
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleAsk();
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <h1 className="text-3xl font-bold">AI Assistant</h1>
            </div>

            {/* Info Card */}
            <div className="glass-card p-6 mb-6">
                <h2 className="text-lg font-semibold mb-2">Your Business Intelligence Advisor</h2>
                <p className="text-gray-300">
                    Ask me anything about your business - sales trends, inventory insights, customer behavior,
                    or marketing suggestions. I analyze your data to provide actionable recommendations.
                </p>
            </div>

            {/* Suggested Questions */}
            {messages.length === 0 && suggestions.length > 0 && (
                <div className="glass-card p-6 mb-6">
                    <h3 className="font-semibold mb-4">Suggested Questions</h3>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleAsk(suggestion)}
                                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Messages */}
            <div className="glass-card mb-6" style={{ height: '500px' }}>
                <div className="h-full flex flex-col">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Ask me a question about your business!</p>
                                </div>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                                : 'bg-white/10 text-gray-100'
                                            }`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-purple-400" />
                                                <span className="text-sm font-semibold">AI Assistant</span>
                                            </div>
                                        )}
                                        <div className="whitespace-pre-wrap">{message.content}</div>
                                    </div>
                                </div>
                            ))
                        )}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/10 rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="spinner w-4 h-4"></div>
                                        <span className="text-sm">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-white/10 p-4">
                        <form onSubmit={handleSubmit} className="flex gap-3">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask about sales, products, customers, or get business advice..."
                                disabled={loading}
                                className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition outline-none"
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                loading={loading}
                                disabled={!query.trim() || loading}
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
