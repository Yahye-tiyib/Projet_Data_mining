'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Send, Bot, User, Loader2, 
  MessageSquare, Trash2, Edit2, 
  PlusCircle, Menu, X, Clock 
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export default function AIPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  // Charger les conversations depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('souk_ai_conversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Restaurer les dates
      const restored = parsed.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      setConversations(restored);
      
      // Ouvrir la conversation la plus récente
      if (restored.length > 0) {
        setCurrentConversationId(restored[0].id);
        setMessages(restored[0].messages);
      } else {
        newConversation();
      }
    } else {
      newConversation();
    }
  }, []);

  // Sauvegarder les conversations
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('souk_ai_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Nouvelle conversation
  const newConversation = () => {
    const newId = Date.now().toString();
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '👋 Bonjour ! Je suis l\'assistant IA de Souk Data Mining. Je peux vous aider à :\n\n• Connaître les prix moyens par produit\n• Comparer les prix entre régions\n• Comprendre les tendances d\'inflation\n• Vous donner des conseils d\'achat\n\nQue souhaitez-vous savoir ?',
      timestamp: new Date()
    };
    
    const newConv: Conversation = {
      id: newId,
      title: `Nouvelle conversation ${conversations.length + 1}`,
      messages: [welcomeMessage],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setConversations([newConv, ...conversations]);
    setCurrentConversationId(newId);
    setMessages([welcomeMessage]);
  };

  // Changer de conversation
  const switchConversation = (convId: string) => {
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      setCurrentConversationId(convId);
      setMessages(conv.messages);
    }
  };

  // Supprimer une conversation
  const deleteConversation = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newConversations = conversations.filter(c => c.id !== convId);
    setConversations(newConversations);
    
    if (currentConversationId === convId) {
      if (newConversations.length > 0) {
        switchConversation(newConversations[0].id);
      } else {
        newConversation();
      }
    }
  };

  // Renommer une conversation
  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitleId(conv.id);
    setEditTitleValue(conv.title);
  };

  const finishRename = (convId: string) => {
    if (editTitleValue.trim()) {
      setConversations(conversations.map(conv =>
        conv.id === convId ? { ...conv, title: editTitleValue.trim() } : conv
      ));
    }
    setEditingTitleId(null);
    setEditTitleValue('');
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    // Mettre à jour la conversation
    const updatedConv = {
      ...conversations.find(c => c.id === currentConversationId)!,
      messages: updatedMessages,
      updatedAt: new Date(),
      title: updatedMessages.length === 1 ? 
        (input.length > 30 ? input.slice(0, 30) + '...' : input) : 
        conversations.find(c => c.id === currentConversationId)!.title
    };
    
    setConversations(conversations.map(conv =>
      conv.id === currentConversationId ? updatedConv : conv
    ));

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date()
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Mettre à jour la conversation avec la réponse
      setConversations(conversations.map(conv =>
        conv.id === currentConversationId ? 
        { ...conv, messages: finalMessages, updatedAt: new Date() } : conv
      ));
      
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Désolé, une erreur est survenue. Veuillez réessayer plus tard.',
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      setConversations(conversations.map(conv =>
        conv.id === currentConversationId ? 
        { ...conv, messages: finalMessages, updatedAt: new Date() } : conv
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-green-800 text-white shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/20 transition lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3">
              <Bot size={28} />
              <div>
                <h1 className="text-xl font-bold">Assistant IA Souk Data Mining</h1>
                <p className="text-green-100 text-sm hidden sm:block">
                  Je réponds à vos questions sur les prix et l'inflation
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        
        {/* Sidebar - Historique des conversations */}
        <div className={`
          fixed lg:relative z-10 w-80 bg-white border-r shadow-lg lg:shadow-none
          transition-transform duration-300 h-[calc(100vh-73px)] overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:block
        `}>
          <div className="p-4">
            {/* Bouton Nouvelle conversation */}
            <button
              onClick={newConversation}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 transition mb-6"
            >
              <PlusCircle size={18} />
              Nouvelle conversation
            </button>

            {/* Liste des conversations */}
            <div className="space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Historique</p>
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => switchConversation(conv.id)}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                    currentConversationId === conv.id
                      ? 'bg-green-50 border-l-4 border-green-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <MessageSquare size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      {editingTitleId === conv.id ? (
                        <input
                          type="text"
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          onBlur={() => finishRename(conv.id)}
                          onKeyPress={(e) => e.key === 'Enter' && finishRename(conv.id)}
                          className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:border-green-500"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {conv.title}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            {formatDate(conv.updatedAt)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => startRename(conv, e)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Edit2 size={14} className="text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-5 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Zone de chat principale */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                      : 'bg-white text-gray-800 border border-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-green-200' : 'text-gray-400'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 shadow">
                    <User size={16} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <Loader2 size={20} className="animate-spin text-green-600" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="border-t bg-white p-4 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question sur les prix, l'inflation, les recommandations..."
                  className="flex-1 p-3 border rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  rows={2}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition disabled:bg-gray-400 flex items-center gap-2 shadow"
                >
                  <Send size={18} />
                  <span className="hidden sm:inline">Envoyer</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                💡 L'assistant utilise les données réelles de la plateforme Souk Data Mining
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}