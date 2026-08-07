"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, UsersRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface GroupItem {
  id: string;
  name: string;
  privacy: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchGroups = async () => {
      setLoading(true);
      const { data } = await supabase.from("groups").select("*");
      if (active) {
        if (data) setGroups(data as GroupItem[]);
        setLoading(false);
      }
    };

    void fetchGroups();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 pb-24 text-slate-900 dir-rtl font-sans">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-lg font-black text-slate-900">المجموعات</h1>
        <Search className="h-5 w-5 text-slate-700" />
      </header>

      <main className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-slate-900">
            <UsersRound className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold">المجموعات المقترحة</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
              لا توجد مجموعات متاحة حالياً
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {groups.map((group) => (
                <div key={group.id} className="space-y-2 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3 text-right shadow-sm">
                  <h3 className="line-clamp-1 text-xs font-bold text-slate-900">{group.name}</h3>
                  <p className="text-[10px] text-slate-400">{group.privacy}</p>
                  <button className="w-full rounded-xl bg-blue-50 py-1.5 text-xs font-bold text-blue-600">انضمام</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}