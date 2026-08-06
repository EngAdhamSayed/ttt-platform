"use client";

import React from "react";
import { Search, TrendingUp, Users, Hash, Home, Compass, PlusCircle, Bell, User } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20 max-w-md mx-auto">
      
      {/* Header مع شريط البحث */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث عن أشخاص، وسوم، أو موضوعات..."
            className="w-full bg-slate-100 text-slate-800 placeholder-slate-400 pr-9 pl-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 border border-slate-200"
          />
        </div>
      </header>

      {/* المحتوى */}
      <main className="p-3 space-y-4">
        
        {/* الموضوعات الأكثر تداولاً */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
            <TrendingUp className="w-4 h-4" />
            <span>الأكثر تداولاً الآن</span>
          </div>
          
          <div className="space-y-2.5 divide-y divide-slate-100">
            <TrendItem tag="#الخصوصية_أولاً" postsCount="1.2k منشور" />
            <TrendItem tag="#منصة_TTT" postsCount="850 منشور" />
            <TrendItem tag="#برمجة_وتكنولوجيا" postsCount="2.4k منشور" />
            <TrendItem tag="#شركة_Beta" postsCount="510 منشور" />
          </div>
        </div>

        {/* اقتراحات المتابعة */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <Users className="w-4 h-4 text-amber-500" />
            <span>صناع محتوى يقترح متابعتهم</span>
          </div>

          <div className="space-y-3">
            <UserSuggestCard name="فريق تطوير TTT" handle="@ttt_dev" bio="الحساب الرسمي لمتابعة تحديثات المنصة" />
            <UserSuggestCard name="مجتمع Beta" handle="@beta_community" bio="مجتمع المطورين والمبتكرين" />
          </div>
        </div>

      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab="explore" />
    </div>
  );
}

function TrendItem({ tag, postsCount }: { tag: string; postsCount: string }) {
  return (
    <div className="pt-2.5 first:pt-0 flex justify-between items-center cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition">
      <div>
        <h4 className="text-xs font-bold text-slate-900">{tag}</h4>
        <p className="text-[10px] text-slate-400">{postsCount}</p>
      </div>
      <Hash className="w-4 h-4 text-slate-300" />
    </div>
  );
}

function UserSuggestCard({ name, handle, bio }: { name: string; handle: string; bio: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 last:border-none last:pb-0">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
          {name[0]}
        </div>
        <div>
          <h5 className="text-xs font-bold text-slate-900">{name}</h5>
          <p className="text-[10px] text-slate-400 dir-ltr text-right">{handle}</p>
        </div>
      </div>
      <button className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition">
        متابعة
      </button>
    </div>
  );
}