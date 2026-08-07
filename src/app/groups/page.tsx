"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Loader2, Plus } from "lucide-react";

interface GroupItem {
  id: string;
  title: string;
  created_at: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");

  const fetchGroups = async () => {
    setLoading(true);
    const { data } = await supabase.from("conversations").select("*").eq("is_group", true);
    if (data) setGroups(data as GroupItem[]);
    setLoading(false);
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim()) return;

    const { error } = await supabase.from("conversations").insert([{ title: groupTitle.trim(), is_group: true }]);
    if (!error) {
      setGroupTitle("");
      setShowModal(false);
      fetchGroups();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 dir-rtl font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-base font-black text-slate-900">المجموعات والمجتمعات</h1>
        <button onClick={() => setShowModal(true)} className="bg-orange-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"><Plus className="w-4 h-4" /><span>مجموعة جديدة</span></button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
        ) : groups.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-xs text-slate-400 border border-slate-200 flex flex-col items-center gap-2">
            <Users className="w-8 h-8 text-slate-300" />
            <span>لا توجد مجموعات متاحة حالياً.</span>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-sm"><Users className="w-5 h-5" /></div>
                <div className="text-right">
                  <h3 className="text-xs font-bold text-slate-900">{group.title}</h3>
                  <span className="text-[10px] text-slate-400">مجموعة عامة</span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-xs space-y-4 text-right">
            <h3 className="text-sm font-bold text-slate-900">إنشاء مجموعة جديدة</h3>
            <input type="text" value={groupTitle} onChange={(e) => setGroupTitle(e.target.value)} placeholder="اسم المجموعة..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-right" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs text-slate-500 font-bold">إلغاء</button>
              <button onClick={handleCreateGroup} className="bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-xl">إنشاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}