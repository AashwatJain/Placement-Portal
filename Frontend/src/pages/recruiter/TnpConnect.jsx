import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Search,
  Plus,
  Paperclip,
  Send,
  MoreVertical,
  ChevronRight,
  Phone,
  Copy,
  CheckCircle2,
  Clock,
  UserCircle2,
  Loader2
} from "lucide-react";

import { fetchTickets, fetchTicketMessages, fetchEmergencyContacts, addTicketMessage, createTicket } from "../../services/recruiterApi";

export default function TnpConnect() {
  const [tickets, setTickets] = useState([]);
  const [activeMessages, setActiveMessages] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [copiedPhone, setCopiedPhone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTicketId) {
      loadMessages(activeTicketId);
    }
  }, [activeTicketId]);

  const loadInitialData = async () => {
    try {
      const [fetchedTickets, fetchedContacts] = await Promise.all([
        fetchTickets(),
        fetchEmergencyContacts()
      ]);
      setTickets(fetchedTickets);
      setEmergencyContacts(fetchedContacts);
      if (fetchedTickets.length > 0) {
        setActiveTicketId(fetchedTickets[0].id);
      }
    } catch (err) {
      console.error("Failed to load TnP Connect data", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId) => {
    try {
      const msgs = await fetchTicketMessages(ticketId);
      setActiveMessages(msgs);
    } catch (err) {
      console.error("Failed to fetch messages for ticket", err);
    }
  };

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicketId) return;
    
    // Optimistic UI update
    const tempMessage = {
      id: Date.now().toString(),
      text: newMessage,
      senderRole: 'recruiter',
      senderName: 'Microsoft Recruiter',
      timestamp: Date.now(),
      time: "Just now" // We format below
    };
    
    setActiveMessages(prev => [...prev, tempMessage]);
    const messageToSend = newMessage;
    setNewMessage("");

    try {
      await addTicketMessage(activeTicketId, {
        text: messageToSend,
        senderRole: 'recruiter',
        senderName: 'Microsoft Recruiter',
        senderId: 'mock_recruiter_1'
      });
      // Refresh to get actual timestamps and server IDs
      loadMessages(activeTicketId);
    } catch (err) {
      console.error("Failed to send message", err);
      // Revert optimistic update on failure
      setActiveMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setNewMessage(messageToSend);
      alert("Failed to send message. Please try again.");
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(id);
    setTimeout(() => setCopiedPhone(null), 2000);
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'pending': return <Clock size={14} className="text-amber-500" />;
      case 'seen': return <CheckCircle2 size={14} className="text-blue-500" />;
      default: return null;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'resolved': return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case 'pending': return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case 'seen': return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading TnP Connect...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 h-[calc(100vh-140px)] flex flex-col">

      {/* ── BREADCRUMBS ── */}
      <nav className="flex shrink-0" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
          <li>
            <Link to="/recruiter" className="hover:text-slate-900 dark:hover:text-white transition-colors">Recruiter</Link>
          </li>
          <li><ChevronRight size={14} /></li>
          <li className="font-semibold text-slate-900 dark:text-white" aria-current="page">TnP Connect</li>
        </ol>
      </nav>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex flex-1 gap-6 overflow-hidden min-h-[500px]">
        
        {/* LEFT SIDEBAR: Ticket History */}
        <div className="hidden lg:flex w-80 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <button onClick={async () => {
              const title = prompt("Enter your query title:");
              if (!title || !title.trim()) return;
              try {
                const newTicket = await createTicket({ title: title.trim(), recruiterId: 'current_recruiter' });
                setTickets(prev => [newTicket, ...prev]);
                setActiveTicketId(newTicket.id);
              } catch (err) {
                console.error('Failed to create ticket', err);
                alert('Failed to create query. Please try again.');
              }
            }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm dark:bg-indigo-600 dark:hover:bg-indigo-500">
              <Plus size={16} /> New Query
            </button>
          </div>
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
              <input type="text" placeholder="Search queries..." className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setActiveTicketId(ticket.id)}
                className={`w-full text-left p-3 rounded-xl transition-all border ${activeTicketId === ticket.id ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800/50 shadow-sm' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <h3 className={`text-sm font-medium line-clamp-1 pr-2 ${activeTicketId === ticket.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-white'}`}>{ticket.title}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getStatusBg(ticket.status)}`}>
                    {getStatusIcon(ticket.status)} {ticket.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                     {formatTimestamp(ticket.updatedAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER PANE: The Chat/Thread */}
        <div className="flex-1 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-500"/> {activeTicket?.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getStatusBg(activeTicket?.status)}`}>
                   {getStatusIcon(activeTicket?.status)} {activeTicket?.status}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Query ID: #{activeTicketId && activeTicketId.toString().padStart(4, '0').slice(-4)}</span>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-900/50">
            {activeMessages.map((msg) => {
              const isRecruiter = msg.senderRole === 'recruiter';
              return (
                <div key={msg.id} className={`flex flex-col ${isRecruiter ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-end gap-2 max-w-[85%] ${isRecruiter ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    {!isRecruiter && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm mb-1">
                        <span className="text-xs font-bold leading-none">TC</span>
                      </div>
                    )}

                    {/* Bubble */}
                    <div className="flex flex-col gap-1">
                      {!isRecruiter && msg.senderName && (
                        <span className="text-[10px] font-semibold text-slate-500 pl-1">{msg.senderName}</span>
                      )}
                      
                      <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isRecruiter 
                          ? 'bg-indigo-600 text-white rounded-br-sm' 
                          : 'bg-white border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-bl-sm'
                      }`}>
                        {msg.text}
                        
                        {/* Attachments */}
                        {msg.attachmentUrl && (
                          <div className={`mt-2 flex items-center gap-2 rounded-lg p-2 text-xs border ${
                            isRecruiter 
                              ? 'bg-indigo-700/50 border-indigo-500/50 text-indigo-50' 
                              : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-300'
                          }`}>
                            <Paperclip size={14} />
                            <span className="font-medium">Attached File</span>
                          </div>
                        )}
                      </div>

                      <span className={`text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 ${isRecruiter ? 'justify-end pr-1' : 'justify-start pl-1'}`}>
                          {msg.time ? msg.time : formatTimestamp(msg.timestamp)}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSendMessage} className="flex gap-2 relative">
              <button type="button" className="shrink-0 flex items-center justify-center p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors dark:hover:bg-indigo-900/30">
                <Paperclip size={20} />
              </button>
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message to the TnP Cell..." 
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-indigo-900/20 transition-all"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className={`shrink-0 flex items-center justify-center p-3 rounded-xl transition-all shadow-sm ${
                  newMessage.trim() 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md' 
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                <Send size={18} className={newMessage.trim() ? 'translate-x-[1px] -translate-y-[1px]' : ''}/>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Emergency Contacts */}
        <div className="hidden xl:flex w-72 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-red-50/50 dark:bg-red-900/5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Phone size={16} className="text-red-500"/> Emergency Contacts
            </h2>
            <p className="text-xs text-slate-500 mt-1">For urgent, day-of-drive issues</p>
          </div>
          
          <div className="p-4 space-y-4 overflow-y-auto">
            {emergencyContacts.map(contact => (
              <div key={contact.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-800/50 relative overflow-hidden group hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors">
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UserCircle2 size={16} className="text-slate-300 dark:text-slate-600"/>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold uppercase text-xs dark:bg-slate-700 dark:text-slate-300">
                      {contact.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{contact.name}</h3>
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{contact.role}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <button 
                      onClick={() => copyToClipboard(contact.phone, contact.id)}
                      className="flex items-center justify-between w-full rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group/btn"
                    >
                      <span className="font-medium tracking-wide font-mono">{contact.phone}</span>
                      {copiedPhone === contact.id ? (
                        <span className="text-emerald-500 font-bold text-[10px] flex items-center gap-1"><CheckCircle2 size={12}/> Copied</span>
                      ) : (
                        <Copy size={14} className="text-slate-400 group-hover/btn:text-slate-600 dark:group-hover/btn:text-slate-400"/>
                      )}
                    </button>
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="flex items-center text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 px-1 truncate">
                        {contact.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
