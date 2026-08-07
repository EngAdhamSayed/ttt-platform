"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, MessageSquare } from "lucide-react";
import Image from "next/image";

interface UserFriend {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const avatarFallback = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80";

export default function MessagesPage() {
  const [friends, setFriends] = useState<UserFriend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadFriends = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) {
        if (active) setLoading(false);
        return;
      }

      const { data } = await supabase.from("profiles").select("id, full_name, avatar_url").neq("id", user.id);

      if (active) {
        if (data) setFriends(data as UserFriend[]);
        setLoading(false);
      }
    };

    void loadFriends();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 pb-24 dir-rtl font-sans">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-lg font-black text-slate-900">المحادثات والرسائل</h1>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : friends.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center text-xs text-slate-400 shadow-sm">
            لا يوجد أصدقاء متاحون للمحادثة حالياً
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 rounded-[1.25rem] border border-slate-200/80 bg-white p-3 shadow-sm transition hover:bg-slate-50"
              >
                <div className="relative h-11 w-11 overflow-hidden rounded-full bg-slate-800 text-xs font-bold text-amber-400">
                  <Image src={friend.avatar_url || avatarFallback} alt="Avatar" fill unoptimized className="object-cover" />
                </div>
                <div className="flex-1 text-right">
                  <h3 className="text-xs font-bold text-slate-900">{friend.full_name}</h3>
                  <p className="text-[10px] text-slate-400">انقر لفتح المحادثة</p>
                </div>
                <MessageSquare className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}