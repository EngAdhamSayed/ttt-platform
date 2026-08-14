"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, UserPlus, UserCheck, Heart, MessageSquare, Check, Trash2, Loader2, BadgeCheck } from "lucide-react";
import Link from "next/link";

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  is_verified: boolean;
}

interface NotificationItem {
  id: string;
  user_id: string;
  actor_id: string;
  type: string;
  content: string;
  entity_id?: string;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔔 تشغيل صوت نغمة إشعار نقي (Web Audio API Synthesizer)
  const playNotificationSound = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();

      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // الاستماع الفوري لأي إشعار جديد في الوقت الفعلي وتشغيل الصوت
    const channel = supabase
      .channel("notifications-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        async (payload) => {
          playNotificationSound();
          const { data: actorData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", payload.new.actor_id)
            .single();

          const newItem: NotificationItem = {
            ...(payload.new as NotificationItem),
            actor: actorData || undefined,
          };
          setNotifications((prev) => [newItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from("notifications")
        .select("*, actor:profiles!actor_id(*)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data) setNotifications(data);
    }
    setLoading(false);
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", session.user.id);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    await supabase.from("notifications").delete().eq("id", id);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 dir-rtl font-sans select-none pb-24">
      {/* الهيدر العلوي */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-black text-slate-900">الإشعارات</h1>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>تحديد الكل كمقروء</span>
          </button>
        )}
      </header>

      {/* قائمة الإشعارات */}
      <main className="p-4 max-w-lg mx-auto space-y-2.5">
        {loading ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center flex justify-center items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            <span className="text-xs font-bold text-slate-500">جاري تحميل الإشعارات...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center space-y-1 shadow-sm">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500">لا توجد إشعارات حتى الآن</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                item.is_read ? "bg-white border-slate-100" : "bg-orange-50/70 border-orange-200 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm border-2 border-orange-500 shadow-sm">
                    {item.actor?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="absolute -bottom-1 -left-1 p-0.5 rounded-full bg-white shadow-sm">
                    {item.type === "friend_request" && <UserPlus className="w-3.5 h-3.5 text-orange-500" />}
                    {item.type === "friend_accept" && <UserCheck className="w-3.5 h-3.5 text-emerald-500" />}
                    {item.type === "new_follower" && <Heart className="w-3.5 h-3.5 text-pink-500" />}
                    {item.type === "like" && <Heart className="w-3.5 h-3.5 text-red-500" />}
                    {item.type === "comment" && <MessageSquare className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800">
                    <span className="font-black text-slate-900">{item.actor?.full_name || "مستخدم"} </span>
                    {item.content}
                  </p>
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(item.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {item.type === "friend_request" && (
                  <Link
                    href="/friends"
                    className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl transition shadow-sm shadow-orange-500/20"
                  >
                    عرض الطلب
                  </Link>
                )}

                <button
                  onClick={() => deleteNotification(item.id)}
                  className="p-1 text-slate-300 hover:text-red-500 transition"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}