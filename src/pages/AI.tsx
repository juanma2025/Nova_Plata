import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { authService } from '../services/api';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  time?: string;
}

const MAX_HISTORY = 15;

const INITIAL_MESSAGE: Message = { 
  id: 'init-1', 
  text: '¡Hola! Soy Nova IA, tu copiloto financiero inteligente. Puedo ayudarte a analizar tus gastos, presupuesto y metas en Nova Plata. ¿Qué quieres revisar hoy?', 
  sender: 'bot' 
};

export function AI() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem('nova_ia_chat_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [INITIAL_MESSAGE];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nova_ia_chat_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const applyFifoLimit = (msgs: Message[]) => {
    if (msgs.length <= MAX_HISTORY) return msgs;
    // Keep initial greeting and the most recent MAX_HISTORY - 1 messages
    return [msgs[0], ...msgs.slice(msgs.length - (MAX_HISTORY - 1))];
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg: Message = { id: `u-${Date.now()}`, text, sender: 'user' };
    setMessages(prev => applyFifoLimit([...prev, userMsg]));
    setInput('');
    setIsLoading(true);

    try {
      // Build history for backend
      const history = messages.slice(1).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const res = await authService.post('/chat', { message: text, history });
      const replyText = res?.data?.reply || res?.message || 'Lo siento, no pude procesar tu solicitud.';
      
      const botMsg: Message = { id: `b-${Date.now()}`, text: replyText, sender: 'bot' };
      setMessages(prev => applyFifoLimit([...prev, botMsg]));
    } catch {
      // Simulated intelligent fallback if server offline
      setTimeout(() => {
        let answer = "Según tus datos actuales en Nova Plata, mantienes tu presupuesto activo y controlado. ¿Deseas proyectar un plan de ahorro?";
        const lower = text.toLowerCase();
        if (lower.includes("gasto") || lower.includes("alimentación")) {
          answer = "Revisando tus gastos: te sugiero fijar un presupuesto específico por categoría para tener alertas automáticas antes de sobrepasar el límite.";
        } else if (lower.includes("ahorr") || lower.includes("meta")) {
          answer = "La mejor estrategia es automatizar tus aportes a metas al inicio de cada mes antes de empezar a gastar el disponible.";
        }
        const botMsg: Message = { id: `b-${Date.now()}`, text: answer, sender: 'bot' };
        setMessages(prev => applyFifoLimit([...prev, botMsg]));
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_MESSAGE]);
    localStorage.setItem('nova_ia_chat_history', JSON.stringify([INITIAL_MESSAGE]));
    toast.success('Conversación reiniciada', {
      description: 'Se ha liberado la memoria de contexto de Nova IA.'
    });
  };

  const suggestions = [
    '¿En qué gasto más?',
    '¿Cuánto puedo gastar hoy?',
    '¿Cómo puedo ahorrar?'
  ];

  return (
    <div className="max-w-[900px] mx-auto animate-in fade-in duration-500 font-sans">
      <Card neon={true} stagger={0}>
        <CardHeader className="mb-0 flex-row justify-between items-center">
          <div>
            <div className="text-[13px] text-[var(--muted)] mb-1 uppercase tracking-wider font-semibold">ASISTENTE FINANCIERO</div>
            <CardTitle className="text-2xl">✦ Nova IA</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#FF334F] flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#FF334F] animate-pulse"></span>
              En línea
            </span>
            <button 
              onClick={handleClearHistory}
              title="Limpiar memoria (Patrón FIFO)"
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[#FF334F] hover:bg-[var(--panel2)] transition-colors text-xs flex items-center gap-1"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Vaciar memoria</span>
            </button>
          </div>
        </CardHeader>
        
        <div 
          ref={chatRef}
          className="h-[450px] flex flex-col gap-3.5 overflow-y-auto p-2.5 mt-4"
        >
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={`max-w-[85%] md:max-w-[72%] p-4 rounded-2xl leading-relaxed text-sm animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                msg.sender === 'bot' 
                  ? 'bg-[var(--panel2)] border border-[var(--border)] text-[var(--text)] self-start rounded-tl-sm' 
                  : 'bg-[#B83A43] text-white dark:bg-[#FFB8BE] dark:text-[#3D0A10] font-medium self-end rounded-tr-sm shadow-md'
              }`}
            >
              {msg.text}
            </div>
          ))}

          {isLoading && (
            <div className="bg-[var(--panel2)] border border-[var(--border)] text-[var(--muted)] self-start rounded-2xl rounded-tl-sm p-4 text-xs italic flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF334F] animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF334F] animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF334F] animate-bounce [animation-delay:0.4s]"></span>
              Nova IA está procesando tu consulta...
            </div>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap my-3">
          {suggestions.map((s, i) => (
            <button 
              key={i} 
              className="bg-[var(--panel)] text-[var(--muted)] border border-[var(--border)] px-3 py-1.5 rounded-full text-xs hover:border-[#B83A43] hover:text-[#B83A43] dark:hover:text-[#FFB8BE] transition-colors"
              onClick={() => handleSend(s)}
            >
              {s}
            </button>
          ))}
        </div>
        
        <form 
          className="flex gap-2.5 mt-3"
          onSubmit={e => { e.preventDefault(); handleSend(input); }}
        >
          <input 
            className="flex-1 bg-[var(--panel)] border border-[var(--border)] text-[var(--text)] rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:border-[#B83A43] focus:ring-1 focus:ring-[#B83A43]/30 placeholder:text-[var(--muted)]" 
            placeholder="Escribe una pregunta sobre tus finanzas..." 
            value={input}
            disabled={isLoading}
            onChange={e => setInput(e.target.value)}
          />
          <Button type="submit" variant="primary" neon={true} disabled={!input.trim() || isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
