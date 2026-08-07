"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Loader2, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    const { data } = await supabase.from("groups").select("*");
    if (data) setGroups(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-24 dir-rtl font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-black text-slate-900">المجموعات</h1>
        <Search className="w-5 h-5 text-slate-700" />
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        <h2 className="text-sm font-bold text-right text-slate-900">المجموعات المقترحة</h2>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        ) : groups.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl text-center text-xs text-slate-400 border border-slate-200">
            لا توجد مجموعات متاحة حالياً
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {groups.map((group) => (
              <div key={group.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-right space-y-2">
                <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{group.name}</h3>
                <p className="text-[10px] text-slate-400">{group.privacy}</p>
                <button className="w-full bg-blue-50 text-blue-600 font-bold py-1.5 rounded-xl text-xs">انضمام</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}