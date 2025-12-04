import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User, ChatMessage, UserRole } from '../types';
import { MessageSquare, X, Send, Bot, Loader2, Sparkles, Mic, StopCircle, Volume2 } from 'lucide-react';

interface ChatBotProps {
    user: User;
}

// Déclaration pour l'API Web Speech (non standard en TS)
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export const ChatBot: React.FC<ChatBotProps> = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'model',
            text: `Salam ${user.firstName} ! Ma ngi tudd Adia. Je suis ton assistante pour l'apprentissage du Coran. Tu peux me parler en Français ou en Wolof.`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Initialisation de la reconnaissance vocale
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'fr-FR'; // Idéalement auto-detect, mais FR couvre le mix Wolof/FR

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Erreur vocale", event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    alert("L'accès au microphone a été refusé. Veuillez vérifier les permissions de votre navigateur.");
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Votre navigateur ne supporte pas la reconnaissance vocale.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setInput(''); // Clear input before speaking
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error("Start error", e);
                setIsListening(false);
            }
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
            
            const systemPrompt = `
                Tu es "Adia", une assistante virtuelle sénégalaise, experte en éducation islamique pour la plateforme "Quran Senegal".
                
                TON PROFIL :
                - Tu es bienveillante, respectueuse et sage.
                - Tu comprends et parles couramment le Français et le Wolof (tu peux mélanger les deux si l'utilisateur le fait).
                - Tu connais le contexte de l'utilisateur : ${user.firstName}, Niveau ${user.level}, XP ${user.xp}.

                TES MISSIONS :
                1. Aider l'apprentissage du Coran (Tajwid, Tafsir, Mémorisation).
                2. Répondre aux questions religieuses avec des sources fiables (Coran & Sunnah).
                3. Guider l'utilisateur dans l'interface (Inscriptions, Quiz, Lives).
                4. Encourager la progression (Gamification).

                STYLE DE RÉPONSE :
                - Si on te parle en Wolof, réponds en Wolof (ou mix Wolof/Français).
                - Sois concise pour une interface de chat.
                - Utilise des expressions locales sénégalaises si approprié (MachAllah, Naka suba ci, Jërëjëf).

                INTERDIT :
                - Ne donne pas d'avis juridiques (Fatwa) complexes, renvoie vers les savants.
                - Ne parle pas de politique ou de sujets polémiques hors religion.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    ...messages.slice(-5).map(m => ({ 
                        role: m.role,
                        parts: [{ text: m.text }]
                    })),
                    { role: 'user', parts: [{ text: userMessage.text }] }
                ],
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.7,
                }
            });

            const textResponse = response.text || "Désolé, je n'ai pas compris. Mën nga ko waxaat ?";

            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: textResponse,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Erreur ChatBot:", error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: "Désolé, j'ai un problème de connexion (Problème réseau bi dafa am jafe-jafe).",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-[350px] md:w-[400px] h-[550px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-700 to-teal-900 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm relative">
                                <Bot size={20} />
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-teal-800 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Adia (Assistant)</h3>
                                <p className="text-[10px] text-teal-200 opacity-90">
                                    Français & Wolof
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-teal-600 text-white rounded-br-none' 
                                        : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex items-center gap-2 text-gray-400 text-xs">
                                    <Loader2 size={14} className="animate-spin text-teal-500" />
                                    <span>Adia écrit...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-2 py-1.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all shadow-inner relative"
                        >
                             {isListening && (
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                                    En écoute...
                                </span>
                            )}
                            <button 
                                type="button"
                                onClick={toggleListening}
                                className={`p-2 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:bg-gray-200'}`}
                                title="Parler (Wolof/Français)"
                            >
                                {isListening ? <StopCircle size={18} /> : <Mic size={18} />}
                            </button>

                            <input 
                                type="text" 
                                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 h-9"
                                placeholder={isListening ? "Parlez maintenant..." : "Poser une question..."}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            
                            <button 
                                type="submit" 
                                disabled={!input.trim() || isLoading}
                                className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Send size={16} className="ml-0.5" />
                            </button>
                        </form>
                        <div className="text-[9px] text-center text-gray-400 mt-2 flex items-center justify-center gap-1 opacity-70">
                            <Sparkles size={8} /> IA Google Gemini & Web Speech API
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-gray-800 text-white rotate-90' : 'bg-teal-600 text-white'}`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={26} />}
            </button>
        </div>
    );
};