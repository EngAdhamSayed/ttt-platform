"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  X,
  Menu,
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
  Search,
  MessageSquare,
  Image as ImageIcon,
  Smile,
  Send,
  Home,
  Film,
  Users,
  UserCheck,
  Bell,
  User,
} from "lucide-react";

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // حالات فتح وإغلاق القوائم المنسدلة في القائمة الجانبية
  const [openEvents, setOpenEvents] = useState(false);
  const [openFavorites, setOpenFavorites] = useState(false);
  const [openGames, setOpenGames] = useState(false);

  // بيانات المستخدم الحقيقية من الداتابيز
  const [userData, setUserData] = useState<{
    fullName: string;
    firstName: string;
    idNumber: string;
    avatarChar: string;
  }>({
    fullName: "جاري التحميل...",
    firstName: "المستخدم",
    idNumber: "#000000",
    avatarChar: "U",
  });

  const [postText, setPostText] = useState("");
  const router = useRouter();

  // جلب بيانات المستخدم المسجل فور فتح الصفحة
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const meta = session.user.user_metadata;
        const name = meta?.full_name || meta?.first_name || session.user.email?.split("@")[0] || "مستخدم";
        const fName = meta?.first_name || name.split(" ")[0] || "مستخدم";
        const shortId = `#${session.user.id.slice(0, 8)}`;
        const firstLetter = name.charAt(0).toUpperCase();

        setUserData({
          fullName: name,
          firstName: fName,
          idNumber: shortId,
          avatarChar: firstLetter,
        });
      }
    };

    fetchUser();
  }, []);

  // تسجيل الخروج
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 dir-rtl font-sans select-none pb-20">
      
      {/* 🟢 الهيدر العلوي الأصلي المطابق للسكرين شوت */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/messages")}
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push("/explore")}
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-black text-lg text-slate-900 tracking-wide">TTT Beta</span>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition mr-1"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 🟢 محتوى الصفحة الرئيسية المطابق للسكرين شوت 100% */}
      <main className="p-4 max-w-lg mx-auto space-y-4">
        
        {/* كارت إضافة منشور جديد */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          
          {/* صورة واسم المستخدم الديناميكي */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-base border-2 border-orange-500 shadow-sm">
                {userData.avatarChar}
              </div>
              <div className="text-right">
                <h4 className="font-black text-sm text-slate-900">{userData.fullName}</h4>
                <span className="text-[11px] font-bold text-slate-400 dir-ltr block text-right">{userData.idNumber}</span>
              </div>
            </div>
          </div>

          {/* خانة الكتابة */}
          <textarea
            rows={2}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder={`بم تفكر يا ${userData.firstName}؟`}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition resize-none font-medium text-slate-800 placeholder:text-slate-400 text-right"
          />

          {/* أزرار الإضافة والنشر */}
          <div className="flex items-center justify-between pt-1">
            <button
              disabled={!postText.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold px-5 py-2 rounded-2xl text-xs flex items-center gap-1.5 transition shadow-sm shadow-orange-500/20"
            >
              <Send className="w-3.5 h-3.5 rotate-180" />
              <span>نشر</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-2xl transition">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>صورة/فيديو</span>
              </button>
              <button className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-2xl transition">
                <Smile className="w-3.5 h-3.5 text-slate-500" />
                <span>شعور</span>
              </button>
            </div>
          </div>

        </div>

        {/* كارت عدم وجود منشورات حالياً */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400">لا توجد منشورات حتى الآن، كن أول من ينشر!</p>
        </div>

      </main>

      {/* 🟢 شريط التنقل السفلي الأصلي المطابق للسكرين شوت */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-2 px-3 flex justify-around items-center z-30">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-orange-600 font-bold text-[10px]">
          <Home className="w-5 h-5" />
          <span>الرئيسية</span>
        </Link>
        <Link href="/reels" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 font-bold text-[10px] transition">
          <Film className="w-5 h-5" />
          <span>الريلز</span>
        </Link>
        <Link href="/friends" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 font-bold text-[10px] transition">
          <UserCheck className="w-5 h-5" />
          <span>الأصدقاء</span>
        </Link>
        <Link href="/groups" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 font-bold text-[10px] transition">
          <Users className="w-5 h-5" />
          <span>المجموعات</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 font-bold text-[10px] transition">
          <Bell className="w-5 h-5" />
          <span>الإشعارات</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 font-bold text-[10px] transition">
          <User className="w-5 h-5" />
          <span>حسابي</span>
        </Link>
      </nav>

      {/* 🔴 خلفية تعتيم الشاشة عند فتح القائمة */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* 🔴 القائمة الجانبية المطلوبة بالكامل طبقاً لرسمتك */}
      <aside
        className={`fixed top-0 right-0 h-full w-[85%] max-w-xs bg-white z-50 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* الجزء العلوي والقابل للسكرول */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-80px)] no-scrollbar">
          
          {/* الهيدر الخارجي للقائمة */}
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

          {/* كارت المستخدم الحقيقي */}
          <Link
            href="/profile"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center justify-between bg-slate-50 hover:bg-orange-50/50 p-3 rounded-2xl border border-slate-100 hover:border-orange-200 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-base border-2 border-orange-500 shadow-sm">
                {userData.avatarChar}
              </div>
              <div className="text-right">
                <h4 className="font-black text-xs text-slate-900 group-hover:text-orange-600 transition">
                  {userData.fullName}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 dir-ltr block">{userData.idNumber}</span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition" />
          </Link>

          {/* المحفوظات والذكريات */}
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

          {/* الأحداث (قائمة منسدلة) */}
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

          {/* الأشخاص المفضلة (قائمة منسدلة) */}
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
              <div className="pr-7 space-y-2 pt-1.5 text-xs font-bold text-slate-500">
                <p className="text-[10px] text-slate-400">لا يوجد أشخاص مفضلة مضافة بعد</p>
              </div>
            )}
          </div>

          {/* الألعاب (قائمة منسدلة) */}
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

          {/* مركز الإعلانات + كارت الإعلان */}
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

            <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white p-3.5 rounded-2xl shadow-sm space-y-1.5 text-right relative overflow-hidden">
              <div className="text-[10px] font-black bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full inline-block">
                إعلان مميز 🚀
              </div>
              <h5 className="font-black text-xs">احصل على خصم 50% على خدماتنا!</h5>
              <p className="text-[10px] text-orange-100 font-medium">سجل الآن واستمتع بجميع المميزات الفاخرة.</p>
            </div>
          </div>

        </div>

        {/* الجزء السفلي الثابت (الإعدادات + تسجيل الخروج) */}
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