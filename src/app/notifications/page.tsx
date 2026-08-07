"use client";

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    let active = true;

    const fetchNotifications = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (active && data) setNotifications(data as NotifItem[]);
      }
      if (active) setLoading(false);
    };

    void fetchNotifications();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 pb-24 text-slate-900 dir-rtl font-sans">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-lg font-black text-slate-900">الإشعارات</h1>
        <button className="rounded-full bg-slate-100 p-2 text-slate-700">
          <Search className="h-5 w-5" />
        </button>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center text-xs text-slate-400 shadow-sm">
            <Bell className="h-8 w-8 text-slate-300" />
            <span>لا توجد إشعارات جديدة حالياً</span>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="space-y-1 rounded-[1.25rem] border border-slate-200 bg-white p-3.5 text-right shadow-sm">
              <p className="text-xs font-medium text-slate-800">{notif.content}</p>
              <span className="text-[10px] text-slate-400">
                {new Date(notif.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))
        )}
      </main>
    </div>
  );
}