'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Send, Mic, Volume2, Bot, User } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import type { ChatMessage } from '@/types';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1', role: 'assistant',
      content: 'สวัสดีค่ะ! หนูชื่อน้องหญิง เป็น AI ประจำแอป ThaiHelp จ้า 🎀 พี่ถามเรื่องปั๊มน้ำมัน เส้นทาง แจ้งเหตุ หรือจะคุยเรื่องการเดินทางก็ได้นะคะ หนูช่วยได้หมดเลย!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, listen, stopListening, sayText } = useSpeech();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (transcript && !isListening) setInput(transcript); }, [transcript, isListening]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: data.reply || 'ขออภัย ไม่สามารถตอบได้', timestamp: new Date(),
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: 'เกิดข้อผิดพลาด กรุณาลองใหม่', timestamp: new Date(),
      }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #060a14, #0a1020)' }}>
      <Header />

      <main className="flex-1 pt-14 pb-32 overflow-y-auto px-4">
        <div className="max-w-lg mx-auto space-y-4 py-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border border-cyan-500/20'
                  : 'bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/20'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot className="w-4 h-4 text-cyan-400" />
                  : <User className="w-4 h-4 text-orange-400" />
                }
              </div>

              <div className={`max-w-[80%] ${msg.role === 'user' ? '' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'metal-btn-accent text-white'
                    : 'metal-panel border-cyan-500/5'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
                {msg.role === 'assistant' && (
                  <button onClick={() => sayText(msg.content)}
                    className="mt-1 ml-2 text-slate-600 hover:text-cyan-400 transition-colors">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border border-cyan-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="metal-panel rounded-2xl px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-cyan-500/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-cyan-500/40 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 bg-cyan-500/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      {/* Input bar */}
      <div className="fixed bottom-16 left-0 right-0 glass px-4 py-3">
        <div className="metal-divider mb-3" />
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <button onClick={isListening ? stopListening : listen}
            className={`metal-btn p-3 rounded-xl transition-all ${isListening ? 'glow-red text-red-400 animate-pulse' : 'text-slate-400 hover:text-cyan-400'}`}>
            <Mic className="w-5 h-5" />
          </button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="พิมพ์ข้อความ หรือกดไมค์พูด..."
            className="flex-1 metal-input rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none" />
          <button onClick={sendMessage} disabled={!input.trim() || loading}
            className="metal-btn-accent disabled:opacity-40 p-3 rounded-xl">
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
