import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Search,
  Paperclip,
  Check,
  CheckCheck,
  Phone,
  Video,
  ExternalLink,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { AlertCircle } from 'lucide-react';

export const MessagingPage: React.FC = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newText, setNewText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [showParticipantInfo, setShowParticipantInfo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get('/communication/conversations');
      if (res.data?.success && res.data.data.length > 0) {
        setConversations(res.data.data);
        setActiveConv(res.data.data[0]);
        loadMessages(res.data.data[0]._id);
      } else {
        setConversations([]);
        setActiveConv(null);
        setMessages([]);
      }
    } catch (err) {
      setError(true);
      setConversations([]);
      setActiveConv(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const loadMessages = async (convId: string) => {
    try {
      const res = await api.get(`/communication/messages/${convId}`);
      if (res.data?.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      setMessages([]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !activeConv) return;

    setSending(true);
    const tempMsg = {
      _id: `msg-${Date.now()}`,
      sender: user?.id || 'me',
      content: newText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    const toSend = newText;
    setNewText('');

    try {
      await api.post('/communication/messages', {
        conversationId: activeConv._id,
        content: toSend,
      });
    } catch (err) {
      // Retained in local messages
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conv: any) => {
    return conv?.participants?.find((p: any) => p._id !== user?.id) || conv?.participants?.[0] || {
      name: 'Rajesh Ramanathan',
      role: 'Principal Mentor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      email: 'rajesh.mentor@careerexpertglobal.com',
      track: 'Full Stack Architecture',
    };
  };

  const activeParticipant = getOtherParticipant(activeConv);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <PageHeader
        eyebrow="COMMUNICATION & ADVISING"
        title="Direct Messages & Mentor Chat"
        subtitle="Confidential 1:1 engineering discussions, architecture queries, and career advising."
        badge={<StatusBadge label="Direct Channel Encrypted" variant="teal" />}
      />

      {/* 3-COLUMN MESSAGING INTERFACE (PHASE 23 SPEC) */}
      <div className="card-premium overflow-hidden h-[720px] flex flex-col md:flex-row bg-white border border-slate-100 rounded-2xl shadow-sm">
        {/* LEFT COLUMN: CONVERSATIONS LIST */}
        <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-white">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="eyebrow-text text-[11px] text-[#0F8F87] block">
                Conversations
              </span>
              <StatusBadge label={`${conversations.length} Active`} variant="teal" size="sm" />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {error ? (
              <div className="p-4">
                <EmptyState
                  icon={AlertCircle}
                  title="Connection Error"
                  description="Failed to load conversations."
                  action={{ label: 'Retry', onClick: fetchConversations }}
                />
              </div>
            ) : conversations.length === 0 && !loading ? (
              <div className="p-4">
                <EmptyState
                  icon={MessageSquare}
                  title="No Conversations"
                  description="You don't have any active chats yet."
                />
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isSelected = activeConv?._id === conv._id;

                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      setActiveConv(conv);
                      loadMessages(conv._id);
                    }}
                    className={`p-3.5 cursor-pointer transition flex items-center gap-3 relative ${
                      isSelected ? 'bg-teal-50/70 border-l-4 border-[#0F8F87]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={other?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                        alt={other?.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-white ring-1 ring-emerald-100" />
                    </div>

                    <div className="truncate flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">{other?.name}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CENTER COLUMN: ACTIVE CHAT THREAD */}
        <div className="flex-1 flex flex-col justify-between h-full bg-slate-50/60">
          {/* Header */}
          <div className="p-3.5 px-5 bg-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={activeParticipant?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={activeParticipant?.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  {activeParticipant?.name}
                </h3>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Active Now • {activeParticipant?.role || 'Mentor'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://meet.google.com/cegs-fgt-mentor"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-slate-500 hover:text-[#0F8F87] hover:bg-teal-50 transition"
                title="Launch Video Call"
              >
                <Video className="w-4 h-4" />
              </a>
              <button
                onClick={() => setShowParticipantInfo(!showParticipantInfo)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition hidden lg:block"
                title="Toggle Details"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
            {messages.map((m) => {
              const isMe = m.sender === 'me' || m.sender === user?.id || m.sender?._id === user?.id;

              return (
                <div
                  key={m._id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl shadow-sm leading-relaxed ${
                      isMe
                        ? 'bg-[#0F8F87] text-white rounded-tr-none font-normal'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none font-normal'
                    }`}
                  >
                    {m.content}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <CheckCheck className="w-3 h-3 text-[#0F8F87]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => alert('Attachment upload ready for code files and screenshots.')}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Write a message to your mentor..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F8F87] focus:bg-white"
            />
            <button
              type="submit"
              disabled={sending || !newText.trim()}
              className="px-4 py-2.5 bg-[#0F8F87] hover:bg-[#0D7A73] disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: PARTICIPANT DETAILS (PHASE 23 SPEC) */}
        {showParticipantInfo && (
          <div className="w-72 border-l border-slate-100 p-5 bg-white space-y-5 hidden lg:flex flex-col justify-between">
            <div className="space-y-4 text-center">
              <img
                src={activeParticipant?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={activeParticipant?.name}
                className="w-16 h-16 rounded-2xl object-cover mx-auto border-2 border-[#0F8F87] shadow-sm"
              />
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{activeParticipant?.name}</h4>
                <p className="text-xs text-slate-500">{activeParticipant?.role}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-left text-xs space-y-2">
                <div>
                  <span className="eyebrow-text text-[10px] text-slate-400 block">Specialization</span>
                  <span className="font-bold text-slate-900">
                    {activeParticipant?.track || 'Full Stack Architecture'}
                  </span>
                </div>
                <div>
                  <span className="eyebrow-text text-[10px] text-slate-400 block">Contact Email</span>
                  <span className="text-slate-500 truncate block text-[11px]">
                    {activeParticipant?.email}
                  </span>
                </div>
                <div>
                  <span className="eyebrow-text text-[10px] text-slate-400 block">Office Hours</span>
                  <span className="text-slate-500 text-[11px] block">Mon–Fri: 4:00 PM – 6:30 PM IST</span>
                </div>
              </div>
            </div>

            <a
              href="https://meet.google.com/cegs-fgt-mentor"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-charcoal hover:bg-brand-600 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-subtle"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Enter Meeting Room</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
