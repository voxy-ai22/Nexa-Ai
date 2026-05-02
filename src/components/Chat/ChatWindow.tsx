/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useEffect, useRef} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {
  Send,
  Plus,
  Settings,
  History,
  LogOut,
  Sparkles,
  Menu,
  X,
  Trash2,
  Cpu,
  RefreshCcw,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {AIModel, Message, ChatHistory, MODEL_CONFIGS} from '../../types';
import CodeBlock from './CodeBlock';

interface ChatProps {
  currentUser: string;
  onLogout: () => void;
}

export default function ChatWindow({currentUser, onLogout}: ChatProps) {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<AIModel>(AIModel.KIMI);
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('Anda adalah Nexa AI, asisten kecerdasan digital dengan pengetahuan mendalam dan kebijaksanaan luar biasa.');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(`nexa_history_${currentUser}`);
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    const savedPrompt = localStorage.getItem(`nexa_prompt_${currentUser}`);
    if (savedPrompt) {
      setSystemPrompt(savedPrompt);
    }
  }, [currentUser]);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(`nexa_history_${currentUser}`, JSON.stringify(history));
    }
  }, [history, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const saveToHistory = (newMessages: Message[]) => {
    if (newMessages.length === 0) return;

    setHistory(prev => {
      const existingIdx = prev.findIndex(h => h.id === currentChatId);
      const title = newMessages[0].content.slice(0, 30) + '...';
      
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          messages: newMessages,
          lastUpdated: Date.now()
        };
        return updated;
      } else {
        const newId = Date.now().toString();
        setCurrentChatId(newId);
        return [{
          id: newId,
          title,
          messages: newMessages,
          lastUpdated: Date.now()
        }, ...prev];
      }
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Add system prompt context if it exists
      const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage.content}`;
      const url = `${MODEL_CONFIGS[currentModel]}${encodeURIComponent(fullPrompt)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.result || data.message || data.text || 'Kecerdasan Nexa memberikan respon kosong.',
        timestamp: Date.now(),
        model: currentModel
      };

      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      saveToHistory(finalMessages);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Mohon maaf, koneksi saya sedang terputus. Silakan coba lagi.',
        timestamp: Date.now(),
        model: currentModel
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setShowSidebar(false);
  };

  const loadChat = (chat: ChatHistory) => {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    setShowSidebar(false);
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(h => h.id !== id));
    if (currentChatId === id) {
      createNewChat();
    }
  };

  return (
    <div className="flex h-screen bg-sacred-blue text-sacred-white relative overflow-hidden font-sans">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{x: -300}}
              animate={{x: 0}}
              exit={{x: -300}}
              className="fixed lg:static inset-y-0 left-0 w-80 glass-dark z-50 flex flex-col border-r border-white/5"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold rounded-xl">
                    <Sparkles className="w-5 h-5 text-sacred-blue" />
                  </div>
                  <h2 className="text-xl font-bold font-sans tracking-tight">NEXA AI</h2>
                </div>
                <button onClick={() => setShowSidebar(false)} className="lg:hidden p-2 text-white/40">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <button
                onClick={createNewChat}
                className="mx-6 p-4 rounded-xl border border-white/10 flex items-center gap-3 hover:bg-white/5 transition-all text-sm font-medium"
              >
                <Plus className="w-5 h-5 text-gold" />
                Mulai Percakapan Baru
              </button>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                <div className="text-[10px] uppercase font-bold text-white/20 tracking-widest mb-4">Riwayat Percakapan</div>
                {history.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => loadChat(chat)}
                    className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                      currentChatId === chat.id 
                        ? 'bg-gold/10 border-gold/20' 
                        : 'hover:bg-white/5 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 pr-8">
                      <History className={`w-4 h-4 ${currentChatId === chat.id ? 'text-gold' : 'text-white/40'}`} />
                      <div className="text-sm truncate font-medium">
                        {chat.title}
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-white/5 space-y-2">
                 <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                   <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                     <User className="w-4 h-4" />
                   </div>
                   <div className="flex-1 text-sm font-medium truncate">{currentUser}</div>
                 </div>
                 <button 
                  onClick={onLogout}
                  className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all text-sm"
                 >
                   <LogOut className="w-4 h-4" />
                   Keluar Akun
                 </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Header */}
        <header className="h-20 lg:h-24 glass-dark border-b border-white/5 flex items-center justify-between px-6 lg:px-12 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSidebar(true)}
              className="lg:hidden p-2 text-white/60"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden lg:flex items-center gap-3">
              <div className="p-2.5 bg-gold/10 rounded-xl border border-gold/20">
                <Cpu className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Kecerdasan Nexa</h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Sinkronisasi Aktif</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex glass px-2 py-1 rounded-2xl items-center gap-1 border-white/5">
              {Object.values(AIModel).map(model => (
                <button
                  key={model}
                  onClick={() => setCurrentModel(model)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all tracking-wider ${
                    currentModel === model 
                      ? 'bg-gold text-sacred-blue shadow-lg shadow-gold/20' 
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {model.replace('-turbo', '').toUpperCase()}
                </button>
              ))}
            </div>

            <select 
              className="md:hidden glass px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider outline-none text-gold border-gold/20"
              value={currentModel}
              onChange={(e) => setCurrentModel(e.target.value as AIModel)}
            >
              {Object.values(AIModel).map(model => (
                <option key={model} value={model} className="bg-sacred-blue text-white">
                  {model.toUpperCase()}
                </option>
              ))}
            </select>

            <button 
              onClick={() => setShowSettings(true)}
              className="p-3 glass hover:border-gold/30 hover:text-gold transition-all rounded-xl"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-8 scroll-smooth scrollbar-thin scrollbar-thumb-white/5">
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.length === 0 ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8">
                <motion.div 
                  initial={{scale: 0.8, opacity: 0}}
                  animate={{scale: 1, opacity: 1}}
                  className="w-24 h-24 rounded-[2.5rem] bg-gold/5 flex items-center justify-center border border-gold/10 relative"
                >
                  <Sparkles className="w-12 h-12 text-gold animate-pulse" />
                  <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full" />
                </motion.div>
                <div className="space-y-3">
                  <h2 className="text-4xl font-bold font-sans tracking-tight text-white mb-2">
                    Salam sejahtera, <span className="text-gold capitalize">{currentUser}</span>
                  </h2>
                  <p className="text-sacred-white/40 max-w-md mx-auto leading-relaxed">
                    Apa yang bisa saya bantu hari ini? Saya adalah Nexa AI, gerbang Anda menuju pengetahuan mendalam dan inspirasi luar biasa.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 w-full max-w-xl">
                  {['Tuliskan sebuah doa', 'Bagaimana cara kerja AI?', 'Tuliskan puisi pendek', 'Jelaskan fisika kuantum'].map((q, i) => (
                    <motion.button
                      key={q}
                      initial={{opacity: 0, y: 10}}
                      animate={{opacity: 1, y: 0}}
                      transition={{delay: 0.1 * i}}
                      onClick={() => {
                        setInput(q);
                      }}
                      className="p-4 glass rounded-2xl text-left text-sm hover:bg-gold/5 hover:border-gold/30 transition-all flex items-center justify-between group"
                    >
                      <span className="text-white/60 group-hover:text-gold transition-colors">{q}</span>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start w-full'}`}
                >
                  <div className={`flex gap-4 ${message.role === 'user' ? 'max-w-[85%] lg:max-w-[75%] flex-row-reverse' : 'w-full flex-row'}`}>
                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-lg ${
                      message.role === 'user' ? 'bg-gold text-sacred-blue' : 'bg-white/5 border border-white/10 text-gold'
                    }`}>
                      {message.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    </div>
                    
                    <div className={`space-y-2 ${message.role === 'assistant' ? 'flex-1 min-w-0' : ''}`}>
                      <div className={`px-5 py-4 rounded-2xl leading-relaxed text-[15px] overflow-x-auto ${
                        message.role === 'user' 
                          ? 'glass bg-gold/10 border-gold/20 text-white' 
                          : 'glass-dark text-sacred-white/90 w-full'
                      }`}>
                        <div className="markdown-body">
                          <ReactMarkdown
                            components={{
                              code({node, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '');
                                const isInline = !match;
                                return !isInline ? (
                                  <CodeBlock
                                    language={match![1]}
                                    value={String(children).replace(/\n$/, '')}
                                  />
                                ) : (
                                  <code className={`${className} bg-white/10 px-1.5 py-0.5 rounded text-gold`} {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 text-[10px] text-white/20 font-bold uppercase tracking-widest ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                        {message.model && (
                          <span className="flex items-center gap-1.5 border-l border-white/10 pl-2 text-gold/60">
                            <Cpu className="w-2.5 h-2.5" />
                            {message.model.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            
            {isLoading && (
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex justify-start">
                <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gold">
                      <RefreshCcw className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div className="glass-dark px-6 py-4 rounded-2xl flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{animationDelay: '0ms'}} />
                        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{animationDelay: '150ms'}} />
                        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce" style={{animationDelay: '300ms'}} />
                      </div>
                      <span className="text-xs font-bold text-gold/60 uppercase tracking-widest">Mencari jawaban...</span>
                    </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 lg:p-12 shrink-0">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute inset-0 bg-gold/5 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            <div className="glass p-2 rounded-[2rem] border-white/10 focus-within:border-gold/30 transition-all flex items-end gap-2 relative">
              <textarea
                className="flex-1 bg-transparent border-none outline-none py-3 px-6 text-[15px] leading-relaxed resize-none text-white placeholder:text-white/20 min-h-[56px] max-h-[200px]"
                placeholder="Tanyakan apa saja ke Nexa..."
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                disabled={!input.trim() || isLoading}
                onClick={handleSend}
                className="w-12 h-12 rounded-2xl bg-gold text-sacred-blue flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all shadow-lg shadow-gold/20 shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="mt-4 text-center text-[10px] text-white/20 font-medium uppercase tracking-[0.2em]">
            Tenaga oleh Kecerdasan Nexa & Nexray Array High-Speed APIs
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{opacity: 0, scale: 0.9, y: 20}}
              animate={{opacity: 1, scale: 1, y: 0}}
              exit={{opacity: 0, scale: 0.9, y: 20}}
              className="w-full max-w-lg glass p-8 rounded-[2.5rem] relative z-10 border-white/10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/10 rounded-xl text-gold">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">Pengaturan Nexa</h3>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-2 text-white/40 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Pondasi Pengetahuan (Prompt Sistem)</label>
                  <div className="glass-dark rounded-2xl p-1 border border-white/5">
                    <textarea
                      className="w-full bg-transparent p-4 outline-none text-sm leading-relaxed text-white/80 min-h-[150px] resize-none"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Tentukan persona AI..."
                    />
                  </div>
                  <p className="text-[10px] text-white/20 px-1">Prompt ini mengatur perilaku inti dan nada dari semua model.</p>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Koneksi Utama</label>
                   <div className="flex items-center justify-between p-4 glass rounded-2xl border-white/5">
                      <div className="flex items-center gap-3">
                        <Cpu className="w-10 h-10 p-2.5 bg-green-500/10 text-green-500 rounded-xl" />
                        <div>
                          <p className="text-sm font-bold">Status API</p>
                          <p className="text-xs text-white/40">nexray.eu.cc (Aktif)</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/20" />
                   </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 glass font-bold py-4 rounded-xl text-white/60 hover:text-white transition-all text-sm uppercase tracking-widest"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem(`nexa_prompt_${currentUser}`, systemPrompt);
                    setShowSettings(false);
                  }}
                  className="flex-1 bg-gold text-sacred-blue font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest shadow-lg shadow-gold/20"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
