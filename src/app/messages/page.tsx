"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Send, Loader2, MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [activeFriend, setActiveFriend] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .neq("id", user.id);

    if (data) setFriends(data);
    setLoading(false);
  };

  const loadMessages = async (friendId: string) => {
    setActiveFriend(friends.find(f => f.id === friendId));
    // هنا بيتم جلب الرسائل من جدول الرسائل المباشر
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-24 dir-rtl font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <h1 className="text-lg font-black text-slate-900">المحادثات والرسائل</h1>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div>
        ) : friends.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-xs text-slate-400 border border-slate-200">
            لا يوجد أصدقاء متاحون للمحادثة حالياً
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div 
                key={friend.id} 
                onClick={() => loadMessages(friend.id)}
                className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition"
              >
                <div className="w-11 h-11 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-xs">
                  {friend.avatar_url ? <img src={friend.avatar_url} className="w-full h-full rounded-full object-cover" /> : friend.full_name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 text-right">
                  <h3 className="text-xs font-bold text-slate-900">{friend.full_name}</h3>
                  <p className="text-[10px] text-slate-400">انقر لفتح المحادثة</p>
                </div>
                <MessageSquare className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}