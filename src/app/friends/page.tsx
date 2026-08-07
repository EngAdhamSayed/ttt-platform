"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, UserCheck, UserX, Users } from "lucide-react";

interface FriendshipItem {
  id: string;
  sender_id: string;
  profiles: { id: string; full_name: string | null; avatar_url: string | null; user_number_id: string | null } | null;
}

export default function FriendsPage() {
  const [requests, setRequests] = useState<FriendshipItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("friendships")
        .select(`id, sender_id, profiles:sender_id(id, full_name, avatar_url, user_number_id)`)
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      if (data) setRequests(data as unknown as FriendshipItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAction = async (id: string, newStatus: "accepted" | "rejected") => {
    const { error } = await supabase.from("friendships").update({ status: newStatus }).eq("id", id);
    if (!error) setRequests((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 dir-rtl font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 shadow-sm text-right">
        <h1 className="text-base font-black text-slate-900">طلبات الصداقة والأصدقاء</h1>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
        ) : requests.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-xs text-slate-400 border border-slate-200 flex flex-col items-center gap-2">
            <Users className="w-8 h-8 text-slate-300" />
            <span>لا توجد طلبات صداقة معلقة حالياً.</span>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs overflow-hidden">
                  {req.profiles?.avatar_url ? <img src={req.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : req.profiles?.full_name?.charAt(0)}
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-bold text-slate-900">{req.profiles?.full_name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">#{req.profiles?.user_number_id}</span>
                </div>
              </div>

              <div className="flex gap-1.5">
                <button onClick={() => handleAction(req.id, "accepted")} className="bg-orange-500 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /><span>تأكيد</span></button>
                <button onClick={() => handleAction(req.id, "rejected")} className="bg-slate-100 text-slate-700 p-2 rounded-xl text-xs font-bold flex items-center gap-1"><UserX className="w-3.5 h-3.5" /><span>حذف</span></button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}