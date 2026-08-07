"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, UserPlus, Check } from "lucide-react";

interface UserProfile {
  id: string;
  user_number_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
}

export default function ExplorePage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

  const fetchUsers = useCallback(async (query = "") => {
    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    let req = supabase.from("profiles").select("id, user_number_id, full_name, avatar_url, role");
    if (currentUser) req = req.neq("id", currentUser.id);
    if (query.trim()) req = req.or(`full_name.ilike.%${query}%,user_number_id.ilike.%${query}%`);

    const { data } = await req.limit(20);
    if (data) setUsers(data as UserProfile[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSendRequest = async (receiverId: string, role: string | null) => {
    if (role === "admin") {
      alert("لا يمكنك إرسال طلب صداقة لمطور ومؤسس المنصة 🛡️");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("friendships").insert([{ sender_id: user.id, receiver_id: receiverId, status: "pending" }]);
    if (!error) setSentRequests((prev) => ({ ...prev, [receiverId]: true }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 dir-rtl font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 shadow-sm space-y-3">
        <h1 className="text-base font-black text-slate-900 text-right">استكشاف الأعضاء والبحث</h1>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); fetchUsers(e.target.value); }}
            placeholder="ابحث بالاسم أو بـ معرف الحساب #ID..."
            className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-2.5 px-4 pr-10 text-xs focus:outline-none focus:border-orange-500 text-right"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
        ) : (
          users.map((profile) => (
            <div key={profile.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs overflow-hidden">
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : profile.full_name?.charAt(0)}
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-bold text-slate-900">{profile.full_name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">#{profile.user_number_id}</span>
                </div>
              </div>

              <button
                onClick={() => handleSendRequest(profile.id, profile.role)}
                disabled={sentRequests[profile.id]}
                className="bg-orange-500 text-white font-bold p-2.5 rounded-xl text-xs flex items-center gap-1 disabled:bg-emerald-500 transition shadow-sm"
              >
                {sentRequests[profile.id] ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{sentRequests[profile.id] ? "تم الطلب" : "إضافة"}</span>
              </button>
            </div>
          ))
        )}
      </main>
    </div>
  );
}