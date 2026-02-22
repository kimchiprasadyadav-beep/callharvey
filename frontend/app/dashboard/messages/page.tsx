"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, Send, Plus, X, ChevronLeft } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8765";

interface Conversation {
  phone: string;
  lead_name: string;
  last_message: string;
  last_message_time: string;
  qualification: Record<string, boolean>;
  message_count: number;
}

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  timestamp: string;
  from: string;
}

const qualLabels: Record<string, string> = {
  budget: "Budget",
  timeline: "Timeline",
  area: "Area",
  property_type: "Property Type",
  visa_status: "Visa Status",
};

function QualBadges({ qual }: { qual: Record<string, boolean> }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(qual).filter(([k]) => k !== "qualified").map(([k, v]) => (
        <span
          key={k}
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            v
              ? "bg-green-900/40 text-green-400 border border-green-800/50"
              : "bg-neutral-800/40 text-neutral-500 border border-neutral-700/50"
          }`}
        >
          {v ? "✅" : "⬜"} {qualLabels[k] || k}
        </span>
      ))}
    </div>
  );
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function SendModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [form, setForm] = useState({ lead_phone: "", lead_name: "", area: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch(`${API}/api/sms/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      onSent();
      onClose();
    } catch {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="bg-surface border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">Send New Message</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        {(["lead_phone", "lead_name", "area"] as const).map((field) => (
          <div key={field} className="mb-4">
            <label className="block text-xs text-muted mb-1.5 capitalize">
              {field.replace("_", " ")}
            </label>
            <input
              required
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              placeholder={field === "lead_phone" ? "+1 555 123 4567" : ""}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-accent hover:bg-accent-hover text-bg font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/sms/conversations`);
      if (res.ok) {
        const data = await res.json();
        // API returns {phone: {lead_name, message_count, qualification, last_message}} — transform to array
        const arr = Array.isArray(data)
          ? data
          : Object.entries(data).map(([phone, c]: [string, any]) => ({
              phone,
              lead_name: c.lead_name || phone,
              last_message: c.last_message?.content || "",
              last_message_time: "",
              qualification: c.qualification || {},
              message_count: c.message_count || 0,
            }));
        setConversations(arr);
      }
    } catch {} finally { setLoading(false); }
  }, []);

  const fetchMessages = useCallback(async (phone: string) => {
    try {
      const res = await fetch(`${API}/api/sms/conversations/${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        // Transform {messages: [{role, content}]} to [{id, direction, body, timestamp}]
        const msgs = (data.messages || []).map((m: any, i: number) => ({
          id: String(i),
          direction: m.role === "assistant" ? "outbound" : "inbound",
          body: m.content,
          timestamp: "",
          from: m.role === "assistant" ? "Harvey" : phone,
        }));
        setMessages(msgs);
      }
    } catch {}
  }, []);

  // removed duplicate

  // Poll conversations every 5s
  useEffect(() => {
    fetchConversations();
    const id = setInterval(fetchConversations, 5000);
    return () => clearInterval(id);
  }, [fetchConversations]);

  // Poll selected conversation every 5s
  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected);
    const id = setInterval(() => fetchMessages(selected), 5000);
    return () => clearInterval(id);
  }, [selected, fetchMessages]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const selectedConvo = conversations.find((c) => c.phone === selected);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-white">Messages</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-bg px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Message
        </button>
      </div>

      <div className="flex-1 flex border border-border rounded-xl overflow-hidden bg-surface min-h-0">
        {/* Left panel - conversation list */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col shrink-0 ${
            selected ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-3 border-b border-border">
            <p className="text-xs text-muted">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-muted text-sm p-4">Loading…</p>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted p-4">
                <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.phone}
                  onClick={() => setSelected(c.phone)}
                  className={`w-full text-left p-3 border-b border-border/50 hover:bg-surface-light transition-colors ${
                    selected === c.phone ? "bg-surface-light" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white truncate">
                      {c.lead_name || c.phone}
                    </span>
                    <span className="text-[10px] text-muted ml-2 shrink-0">
                      {c.last_message_time ? timeAgo(c.last_message_time) : ""}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate mb-1.5">{c.last_message}</p>
                  {c.qualification && <QualBadges qual={c.qualification} />}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel - thread */}
        <div className={`flex-1 flex flex-col min-w-0 ${!selected ? "hidden md:flex" : "flex"}`}>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-muted">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-3 border-b border-border flex items-center gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="md:hidden text-muted hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {selectedConvo?.lead_name || selected}
                  </p>
                  <p className="text-xs text-muted font-mono">{selected}</p>
                </div>
                {selectedConvo?.qualification && (
                  <div className="hidden sm:block">
                    <QualBadges qual={selectedConvo.qualification} />
                  </div>
                )}
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.direction === "inbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                        m.direction === "inbound"
                          ? "bg-accent text-bg rounded-br-md"
                          : "bg-surface-light text-white border border-border rounded-bl-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          m.direction === "inbound" ? "text-bg/60" : "text-muted"
                        }`}
                      >
                        {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <SendModal onClose={() => setShowModal(false)} onSent={fetchConversations} />
      )}
    </div>
  );
}
