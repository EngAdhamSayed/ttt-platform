"use client";

import React, { useState } from "react";
import { 
  ArrowRight, User, Shield, Bell, Lock, 
  Moon, LogOut, ChevronLeft, Globe 
} from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20 max-w-md mx-auto">
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <Link href="/profile" className="p-1 hover:bg-slate-100 rounded-lg transition">
          <ArrowRight className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-sm font-bold text-slate-900">الإعدادات والخصوصية</h1>
        <div className="w-5"></div>
      </header>

      <main className="p-3 space-y-4">
        
        {/* قسم الحساب */}
        <SettingsSection title="الحساب والأمان">
          <SettingItem icon={<User className="w-4 h-4 text-amber-500" />} label="معلومات الحساب" />
          <SettingItem icon={<Lock className="w-4 h-4 text-amber-500" />} label="تغيير كلمة السر" />
        </SettingsSection>

        {/* قسم الخصوصية والمظهر */}
        <SettingsSection title="التفضيلات والخصوصية">
          <div className="flex items-center justify-between p-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-slate-800">حساب خاص (Private)</span>
            </div>
            <input 
              type="checkbox" 
              checked={privateAccount}
              onChange={(e) => setPrivateAccount(e.target.checked)}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-slate-800">الوضع الداكن (Dark Mode)</span>
            </div>
            <input 
              type="checkbox" 
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
          </div>
        </SettingsSection>

        {/* قسم الدعم وBeta */}
        <SettingsSection title="عن المنصة">
          <SettingItem icon={<Globe className="w-4 h-4 text-amber-500" />} label="عن منصة TTT ورؤية Beta" />
          <SettingItem icon={<Bell className="w-4 h-4 text-amber-500" />} label="مركز المساعدة والشروط" />
        </SettingsSection>

        {/* زر الخروج */}
        <Link 
          href="/login"
          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold p-3.5 rounded-2xl border border-rose-200/80 flex items-center justify-center gap-2 text-xs transition"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </Link>

      </main>

      <BottomNav activeTab="profile" />
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-[11px] font-bold text-slate-400 px-2">{title}</h3>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SettingItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-xs font-semibold text-slate-800">{label}</span>
      </div>
      <ChevronLeft className="w-4 h-4 text-slate-300" />
    </div>
  );
}