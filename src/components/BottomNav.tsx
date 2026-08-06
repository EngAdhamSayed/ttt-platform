"use client";

import React from "react";
import Link from "next/link";
import { Home, Compass, PlusCircle, Bell, User } from "lucide-react";

export default function BottomNav({ activeTab }: { activeTab: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-6 py-2 flex justify-between items-center max-w-md mx-auto shadow-lg">
      <Link href="/" className={`flex flex-col items-center ${activeTab === "home" ? "text-amber-600 font-bold" : "text-slate-400 hover:text-slate-600"}`}>
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">الرئيسية</span>
      </Link>

      <Link href="/explore" className={`flex flex-col items-center ${activeTab === "explore" ? "text-amber-600 font-bold" : "text-slate-400 hover:text-slate-600"}`}>
        <Compass className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">استكشف</span>
      </Link>

      <Link href="/" className="flex flex-col items-center">
        <PlusCircle className="w-6 h-6 text-amber-500" />
      </Link>

      <Link href="/notifications" className={`flex flex-col items-center ${activeTab === "notifications" ? "text-amber-600 font-bold" : "text-slate-400 hover:text-slate-600"}`}>
        <Bell className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">التنبيهات</span>
      </Link>

      <Link href="/profile" className={`flex flex-col items-center ${activeTab === "profile" ? "text-amber-600 font-bold" : "text-slate-400 hover:text-slate-600"}`}>
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">حسابي</span>
      </Link>
    </nav>
  );
}