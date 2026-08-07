"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Globe, Moon, Bell, Shield, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    language: "ar",
    theme: "light",
    notify_likes: true,
    notify_comments: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("language, theme, notify_likes, notify_comments").eq("id", user.id).single();
        if (data) setSettings(data as typeof settings);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleUpdate = async (key: string, value: unknown) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ [key]: value }).eq("id", user.id);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 dir-rtl font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 shadow-sm text-right">
        <h1 className="text-base font-black text-slate-900">الإعدادات والخصوصية</h1>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4 text-right">
        {/* Language & Theme */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">التفضيلات العامة</h2>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-slate-400" /><span>لغة التطبيق</span></div>
            <select
              value={settings.language}
              onChange={(e) => handleUpdate("language", e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2"><Moon className="w-4 h-4 text-slate-400" /><span>المظهر (الثيم)</span></div>
            <select
              value={settings.theme}
              onChange={(e) => handleUpdate("theme", e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
            >
              <option value="light">فاتح (Light)</option>
              <option value="dark">داكن (Dark)</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">إشعارات التفاعل</h2>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2"><Bell className="w-4 h-4 text-slate-400" /><span>إشعارات التفاعلات واللايكات</span></div>
            <input
              type="checkbox"
              checked={settings.notify_likes}
              onChange={(e) => handleUpdate("notify_likes", e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
          </div>
        </div>

        <button
          onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}
          className="w-full bg-red-50 text-red-600 font-bold p-3 rounded-2xl text-xs flex justify-center items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج من الحساب</span>
        </button>
      </main>
    </div>
  );
}