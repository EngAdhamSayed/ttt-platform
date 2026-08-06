"use client";

import React, { useState } from "react";
import { 
  Settings, MapPin, Calendar, Edit3, Grid, Bookmark, Heart, 
  Share2, MessageSquare, ArrowRight 
} from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20 max-w-md mx-auto">
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <Link href="/" className="p-1 hover:bg-slate-100 rounded-lg transition">
          <ArrowRight className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-sm font-bold text-slate-900">الملف الشخصي</h1>
        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-600">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Cover & Avatar */}
      <div className="relative">
        <div className="h-28 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 w-full"></div>
        <div className="absolute -bottom-10 right-4 w-20 h-20 rounded-full bg-white p-1 shadow-md">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-extrabold text-white text-2xl">
            أ
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="mt-12 px-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-base font-black text-slate-900">أدهم سيدي</h2>
            <p className="text-xs text-slate-400 dir-ltr text-right">@adham_sayed</p>
          </div>
          <button className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-sm">
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>تعديل الملف</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          مطور برمجيات وباحث عن تجربة تواصل فريدة ونظيفة. أعمل على تطوير TTT لتكون البديل الأفضل للجميع 🚀
        </p>

        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>القاهرة، مصر</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>انضم أغسطس 2026</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-around border-t border-b border-slate-200 py-2.5 text-center my-2">
          <div>
            <span className="block font-black text-sm text-slate-900">12</span>
            <span className="text-[10px] text-slate-400 font-medium">منشورات</span>
          </div>
          <div className="border-r border-slate-200 pr-6">
            <span className="block font-black text-sm text-slate-900">248</span>
            <span className="text-[10px] text-slate-400 font-medium">متابِع</span>
          </div>
          <div className="border-r border-slate-200 pr-6">
            <span className="block font-black text-sm text-slate-900">190</span>
            <span className="text-[10px] text-slate-400 font-medium">يتابعهم</span>
          </div>
        </div>
      </div>

      {/* Tabs (منشوراتي / المحفوظات) */}
      <div className="px-3 mt-2">
        <div className="flex bg-white rounded-xl p-1 border border-slate-200/80 mb-3">
          <button 
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === "posts" ? "bg-amber-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>منشوراتي</span>
          </button>
          <button 
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === "saved" ? "bg-amber-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>المحفوظات</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "posts" ? (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-900 font-bold text-white flex items-center justify-center text-xs">
                    أ
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">أدهم سيدي</h4>
                    <p className="text-[10px] text-slate-400 dir-ltr text-right">@adham_sayed</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">منذ ساعتين</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                تم بحمد الله إطلاق واجهة منصة TTT الجديدة! شغالين على ميزات الخصوصية والـ Real-time chat وسعيد جداً بالنتيجة 🎉
              </p>
              <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-slate-400 text-xs">
                <button className="flex items-center gap-1 hover:text-rose-500"><Heart className="w-4 h-4" /><span className="text-[10px]">14</span></button>
                <button className="flex items-center gap-1 hover:text-amber-600"><MessageSquare className="w-4 h-4" /><span className="text-[10px]">3</span></button>
                <button className="flex items-center gap-1 hover:text-blue-500"><Share2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            لا توجد عناصر محفوظة حالياً.
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="profile" />
    </div>
  );
}