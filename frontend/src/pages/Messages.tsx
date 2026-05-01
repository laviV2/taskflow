import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, Search, Hash, MessageSquare } from 'lucide-react';
import { useStore, api } from '../store/useStore';

const Messages = () => {
  const { user, team, fetchTeam, projects, fetchProjects, attendance, fetchAttendance } = useStore();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null); // { type: 'user' | 'project', id: string, name: string }
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTeam();
    fetchProjects();
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Polling for messages
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const url = selectedChat.type === 'project' 
        ? `/messages/project/${selectedChat.id}` 
        : `/messages/user/${selectedChat.id}`; // Note: user-to-user not fully implemented in backend yet, we'll focus on project chat
      const res = await api.get(url);
      setMessages(res.data);
    } catch (e) { console.error('Failed to fetch messages'); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    
    try {
      const payload = selectedChat.type === 'project' 
        ? { content: newMessage, project_id: selectedChat.id }
        : { content: newMessage, receiver_id: selectedChat.id };
      
      const res = await api.post('/messages', payload);
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (e) { alert('Failed to send message'); }
  };

  const isOnline = (id: string) => {
    return attendance.some(a => 
      a.user_id === id && 
      new Date(a.date).toDateString() === new Date().toDateString() && 
      !a.signOut
    );
  };

  return (
    <div className="h-[calc(100vh-120px)] flex glass-card overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-bordercolor flex flex-col bg-secondary/20">
        <div className="p-6 border-b border-bordercolor">
          <h2 className="text-xl font-bold text-text-primary mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-secondary border border-bordercolor rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
          {/* Projects/Channels */}
          <div>
            <p className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Project Channels</p>
            <div className="space-y-1">
              {projects.map(p => (
                <button 
                  key={p.id}
                  onClick={() => setSelectedChat({ type: 'project', id: p.id, name: p.name })}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selectedChat?.id === p.id ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-muted hover:bg-white/5 hover:text-text-primary'}`}
                >
                  <Hash size={18} />
                  <span className="text-sm font-medium truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <p className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Direct Messages</p>
            <div className="space-y-1">
              {team.filter(t => t.id !== user?.id).map(t => (
                <button 
                  key={t.id}
                  onClick={() => setSelectedChat({ type: 'user', id: t.id, name: t.name })}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${selectedChat?.id === t.id ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-muted hover:bg-white/5 hover:text-text-primary'}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-secondary border border-bordercolor flex items-center justify-center text-xs font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-card rounded-full ${isOnline(t.id) ? 'bg-accent-success' : 'bg-slate-600'}`} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-[10px] text-text-muted truncate capitalize">{t.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-primary/5">
        {selectedChat ? (
          <>
            <div className="h-20 border-b border-bordercolor flex items-center justify-between px-8 bg-card/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                {selectedChat.type === 'project' ? (
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/20 text-accent-primary flex items-center justify-center font-bold">#</div>
                ) : (
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-accent-secondary/20 text-accent-secondary flex items-center justify-center font-bold">
                      {selectedChat.name.charAt(0)}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-card rounded-full ${isOnline(selectedChat.id) ? 'bg-accent-success' : 'bg-slate-600'}`} />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-text-primary">{selectedChat.name}</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isOnline(selectedChat.id) || selectedChat.type === 'project' ? 'text-accent-success' : 'text-text-muted'}`}>
                    {selectedChat.type === 'project' ? 'Multi-user Channel' : (isOnline(selectedChat.id) ? 'Active Now' : 'Offline')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar scroll-smooth">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 animate-fadeIn">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-text-muted border border-bordercolor shadow-xl">
                    <MessageSquare size={40} />
                  </div>
                  <p className="text-text-muted max-w-xs font-medium">No messages here yet. <br/>Start the mission collaboration!</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id;
                const showSender = !isMe && (i === 0 || messages[i-1].sender_id !== msg.sender_id);
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div className={`flex gap-3 max-w-[75%] ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && (
                        <div className={`w-8 h-8 rounded-lg bg-secondary border border-bordercolor flex items-center justify-center text-[10px] font-bold shrink-0 mt-1 transition-opacity ${showSender ? 'opacity-100' : 'opacity-0'}`}>
                          {msg.sender.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        {showSender && <p className="text-[10px] font-bold text-accent-secondary mb-1 ml-1 uppercase tracking-wider">{msg.sender.name}</p>}
                        <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm transition-all hover:shadow-md ${isMe ? 'bg-accent-primary text-white rounded-tr-none' : 'bg-card text-text-primary rounded-tl-none border border-bordercolor'}`}>
                          {msg.content}
                        </div>
                        <p className={`text-[8px] text-text-muted mt-1 font-bold ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} className="h-4" />
            </div>

            <div className="p-6 border-t border-bordercolor bg-card/30">
              <form onSubmit={handleSendMessage} className="relative">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedChat.type === 'project' ? '#' : ''}${selectedChat.name}`}
                  className="w-full bg-secondary border border-bordercolor rounded-2xl px-6 py-4 text-text-primary focus:outline-none focus:border-accent-primary transition-all pr-16 shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-accent-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-accent-primary/10 flex items-center justify-center text-accent-primary animate-pulse">
              <MessageSquare size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold text-text-primary">Communication Hub</h3>
              <p className="text-text-muted max-w-sm">Select a project channel or team member to start collaborating in real-time.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
