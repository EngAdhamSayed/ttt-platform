"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LogOut, Shield, User, Bell, Lock } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-24 dir-rtl font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <h1 className="text-lg font-black text-slate-900">الإعدادات والخصوصية</h1>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 text-right">
          <h2 className="text-xs font-bold text-blue-600">Meta Accounts Center</h2>
          <div className="space-y-2 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer">
              <User className="w-4 h-4 text-slate-500" />
              <span>التفاصيل الشخصية</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>كلمة السر والأمان</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer">
              <Bell className="w-4 h-4 text-slate-500" />
              <span>تفضيلات الإشعارات</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold p-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 border border-rose-200 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج من الحساب</span>
        </button>
      </main>
    </div>
  );
}