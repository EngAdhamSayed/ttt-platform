"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface NotifItem {
  id: string;
  content: string;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setNotifications(data as NotifItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-24 dir-rtl font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-black text-slate-900">الإشعارات</h1>
        <button className="p-2 rounded-full bg-slate-100 text-slate-700">
          <Search className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-xs text-slate-400 border border-slate-200 shadow-sm flex flex-col items-center gap-2">
            <Bell className="w-8 h-8 text-slate-300" />
            <span>لا توجد إشعارات جديدة حالياً</span>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-right space-y-1">
              <p className="text-xs text-slate-800 font-medium">{notif.content}</p>
              <span className="text-[10px] text-slate-400">
                {new Date(notif.created_at).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </main>
    </div>
  );
}