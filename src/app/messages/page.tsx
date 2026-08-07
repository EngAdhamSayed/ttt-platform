"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Send, MessageCircle, Image } from "lucide-react";

interface MessageItem {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
      if (data) setMessages(data as MessageItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();

    // Subscribe to Realtime Messages
    const channel = supabase
      .channel("public:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new as MessageItem]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    const { data: conv } = await supabase.from("conversations").select("id").limit(1).single();
    let conversationId = conv?.id;

    if (!conversationId) {
      const { data: newConv } = await supabase.from("conversations").insert([{ is_group: false }]).select().single();
      conversationId = newConv?.id;
    }

    if (conversationId) {
      await supabase.from("messages").insert([{ conversation_id: conversationId, sender_id: currentUserId, content: newMessage.trim() }]);
      setNewMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 dir-rtl font-sans flex flex-col justify-between">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 shadow-sm text-right">
        <h1 className="text-base font-black text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-orange-500" />
          <span>المحادثات والرسائل الفورية</span>
        </h1>
      </header>

      <main className="max-w-md mx-auto w-full p-4 space-y-3 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
        ) : messages.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-xs text-slate-400 border border-slate-200">لا توجد رسائل سابقة، ابدأ المحادثة الآن!</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${isMe ? "bg-orange-500 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"}`}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </main>

      <footer className="sticky bottom-16 bg-white border-t border-slate-200 p-3 max-w-md mx-auto w-full">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-orange-500 text-right"
          />
          <button type="submit" disabled={!newMessage.trim()} className="bg-orange-500 text-white p-2.5 rounded-2xl disabled:opacity-50"><Send className="w-4 h-4" /></button>
        </form>
      </footer>
    </div>
  );
}