"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  X,
  Menu,
  User,
  Bookmark,
  History,
  Calendar,
  ChevronDown,
  ChevronUp,
  Heart,
  Gamepad2,
  Megaphone,
  Plus,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // حالات فتح وإغلاق القوائم المنسدلة
  const [openEvents, setOpenEvents] = useState(false);
  const [openFavorites, setOpenFavorites] = useState(false);
  const [openGames, setOpenGames] = useState(false);

  const router = useRouter();

  // تسجيل الخروج
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 dir-rtl font-sans select-none">
      
      {/* 🟢 الهيدر العلوي للموقع مع زر فتح القائمة */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-orange-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-2xl bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <Image src="/logo.png" alt="TTT Logo" fill className="object-contain" priority />
            </div>
            <span className="font-black text-base text-slate-900 tracking-wide">TTT Platform</span>
          </div>
        </div>

        <Link
          href="/profile"
          className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm border-2 border-orange-500 shadow-sm"
        >
          A
        </Link>
      </header>

      {/* 🟢 محتوى الصفحة الرئيسية التجريبي */}
      <main className="p-4 max-w-lg mx-auto space-y-4">
        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm text-center space-y-2">
          <h2 className="text-xl font-black text-slate-900">مرحباً بك في TTT Platform 🚀</h2>
          <p className="text-xs font-bold text-slate-500">اضغط على القائمة أعلى اليمين لاستكشاف الخيارات الجديدة بالكامل!</p>
        </div>
      </main>

      {/* 🔴 خلفية تعتيم الشاشة عند فتح القائمة */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* 🔴 القائمة الجانبية المطابقة للتصميم 100% */}
      <aside
        className={`fixed top-0 right-0 h-full w-[85%] max-w-xs bg-white z-50 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* الجزء العلوي والقابل للسكرول */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-80px)] no-scrollbar">
          
          {/* 1️⃣ الهيدر الخارجي للقائمة (زر الإغلاق + الشعار) */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-left dir-ltr">
              <div className="w-8 h-8 relative">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 leading-none">TTT Platform</h3>
                <span className="text-[9px] font-bold text-orange-500">أحد منصات Beta</span>
              </div>
            </div>
          </div>

          {/* 2️⃣ كارت المستخدم (ينقل لصفحته الشخصية) */}
          <Link
            href="/profile"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center justify-between bg-slate-50 hover:bg-orange-50/50 p-3 rounded-2xl border border-slate-100 hover:border-orange-200 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-base border-2 border-orange-500 shadow-sm">
                A
              </div>
              <div className="text-right">
                <h4 className="font-black text-xs text-slate-900 group-hover:text-orange-600 transition">
                  Adham Sayed
                </h4>
                <span className="text-[10px] font-bold text-slate-400 dir-ltr block">#76293885</span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition" />
          </Link>

          {/* 3️⃣ المحفوظات والذكريات */}
          <div className="space-y-1 pt-1">
            <Link
              href="/saved"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-2xl text-slate-700 hover:bg-slate-50 hover:text-orange-600 font-bold text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-orange-500" />
                <span>المحفوظات</span>
              </div>
            </Link>

            <Link
              href="/memories"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-2xl text-slate-700 hover:bg-slate-50 hover:text-orange-600 font-bold text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-orange-500" />
                <span>الذكريات</span>
              </div>
            </Link>
          </div>

          <hr className="border-slate-100" />

          {/* 4️⃣ الأحداث (قائمة منسدلة) */}
          <div className="space-y-1">
            <button
              onClick={() => setOpenEvents(!openEvents)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>الأحداث</span>
              </div>
              {openEvents ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {openEvents && (
              <div className="pr-7 space-y-1.5 pt-1 text-[11px] font-bold text-slate-500">
                <Link href="/events/birthdays" className="block p-1.5 hover:text-orange-600 transition">🎉 أعياد الميلاد</Link>
                <Link href="/events/engagements" className="block p-1.5 hover:text-orange-600 transition">💍 خطوبة وزواج</Link>
                <Link href="/events/special" className="block p-1.5 hover:text-orange-600 transition">✨ مناسبات خاصة</Link>
              </div>
            )}
          </div>

          {/* 5️⃣ الأشخاص المفضلة (حد أقصى 5 أشخاص - قائمة منسدلة) */}
          <div className="space-y-1">
            <button
              onClick={() => setOpenFavorites(!openFavorites)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-orange-500" />
                <span>الأشخاص المفضلة <span className="text-[9px] text-slate-400 font-normal">(حد أقصى 5)</span></span>
              </div>
              {openFavorites ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {openFavorites && (
              <div className="pr-7 space-y-2 pt-1.5">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px]">
                      {item}
                    </div>
                    <span>شخص مفضل {item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6️⃣ الألعاب (قائمة منسدلة) */}
          <div className="space-y-1">
            <button
              onClick={() => setOpenGames(!openGames)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <Gamepad2 className="w-4 h-4 text-orange-500" />
                <span>الألعاب</span>
              </div>
              {openGames ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {openGames && (
              <div className="pr-7 space-y-1.5 pt-1 text-[11px] font-bold text-slate-500">
                <Link href="/games/popular" className="block p-1.5 hover:text-orange-600 transition">🎮 الألعاب الأكثر شائعة</Link>
                <Link href="/games/challenge" className="block p-1.5 hover:text-orange-600 transition">🏆 التحديات الأسبوعية</Link>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* 7️⃣ مركز الإعلانات + كارت الإعلان */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-xs text-slate-800">مركز الإعلانات</span>
              </div>
              <button className="bg-orange-50 hover:bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-1 rounded-xl flex items-center gap-0.5 border border-orange-200 transition">
                <Plus className="w-3 h-3" />
                <span>أضف إعلانك</span>
              </button>
            </div>

            {/* كارت الإعلان */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white p-3.5 rounded-2xl shadow-sm space-y-1.5 text-right relative overflow-hidden">
              <div className="text-[10px] font-black bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full inline-block">
                إعلان مميز 🚀
              </div>
              <h5 className="font-black text-xs">احصل على خصم 50% على خدماتنا!</h5>
              <p className="text-[10px] text-orange-100 font-medium">سجل الآن واستمتع بجميع المميزات الفاخرة.</p>
            </div>
          </div>

        </div>

        {/* 8️⃣ الجزء السفلي الثابت (الإعدادات + تسجيل الخروج) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-1">
          <Link
            href="/settings"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-2.5 p-2.5 rounded-2xl text-slate-700 hover:bg-white font-bold text-xs transition"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>الإعدادات والخصوصية</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-red-600 hover:bg-red-50 font-bold text-xs transition"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>تسجيل الخروج</span>
          </button>
        </div>

      </aside>
    </div>
  );
}