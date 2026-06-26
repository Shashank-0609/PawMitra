import React from 'react';
import { X, Send, Minimize2 } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

interface ChatWindowProps {
  hostName: string;
  hostImage: string;
  onClose: () => void;
}

export default function ChatWindow({ hostName, hostImage, onClose }: ChatWindowProps) {
  const [messages, setMessages] = React.useState<{ text: string; isUser: boolean; time: string }[]>([
    { text: `Hi! I'm ${hostName}. How can I help you today?`, isUser: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [minimized, setMinimized] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessageText = input;
    const userMessage = {
      text: userMessageText,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Use import.meta.env for Vite — works in both dev and Vercel production
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (process.env as any).GEMINI_API_KEY;
      
      if (!apiKey) {
        // Graceful fallback if no API key configured
        setTimeout(() => {
          setMessages(prev => [...prev, {
            text: "Thanks for your message! I'll get back to you shortly about your pet stay inquiry.",
            isUser: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          setIsTyping(false);
        }, 1000);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const history = messages.map(msg => ({
        role: msg.isUser ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          ...history,
          { role: "user", parts: [{ text: userMessageText }] }
        ],
        config: {
          systemInstruction: `You are ${hostName}, a friendly and professional pet host on the PawMitra platform. 
          Your goal is to help pet owners feel comfortable leaving their pets with you. 
          Be warm, reassuring, and answer questions about your experience, home environment, and pet care philosophy.
          Keep your responses concise, conversational, and helpful. 
          If you don't know a specific detail, offer to check and get back to them.
          Always maintain the persona of a caring, experienced pet host based in India.`,
        },
      });

      const botText = response.text || "I'm sorry, I couldn't process that. Could you please rephrase?";
      
      setMessages(prev => [...prev, {
        text: botText,
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        text: "I'm having a bit of trouble connecting right now. Please try again in a moment!",
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (minimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 bg-navy text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 cursor-pointer z-50"
        onClick={() => setMinimized(false)}
      >
        <img src={hostImage} alt={hostName} className="w-10 h-10 rounded-full object-cover border-2 border-white/20" referrerPolicy="no-referrer" />
        <div>
          <div className="font-bold text-sm">{hostName}</div>
          <div className="text-[10px] opacity-60">Click to open chat</div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="ml-2 p-1 hover:bg-white/10 rounded-lg">
          <X size={16} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      className="fixed bottom-6 right-6 w-[380px] md:w-[400px] h-[560px] bg-white rounded-[2rem] shadow-2xl border border-stone-100 flex flex-col z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-navy p-5 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={hostImage} 
              alt={hostName} 
              className="w-11 h-11 rounded-full object-cover border-2 border-white/20" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-navy rounded-full" />
          </div>
          <div>
            <div className="font-bold text-sm">{hostName}</div>
            <div className="text-[10px] opacity-60 uppercase tracking-widest font-bold">Online Now</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Minimize2 size={18} />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-stone-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.isUser ? 'bg-navy text-white rounded-2xl rounded-tr-none' : 'bg-white text-stone-800 rounded-2xl rounded-tl-none shadow-sm border border-stone-100'} p-3.5`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <div className={`text-[10px] mt-1.5 ${msg.isUser ? 'text-white/50' : 'text-stone-400'} font-bold`}>{msg.time}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-stone-100">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-stone-100">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..." 
            className="w-full pl-4 pr-14 py-3.5 bg-stone-50 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-navy/10 transition-all text-sm"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-navy text-white rounded-xl flex items-center justify-center hover:bg-navy/90 transition-colors disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
