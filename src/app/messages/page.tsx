"use client";

import React from "react";
import { MessageSquare, Search, Lock } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20 max-w-md mx-auto">
      
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <h1 className="text-sm font-bold text-slate-900">الرسائل المباشرة</h1>
        <div className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
          <Lock className="w-3 h-3" />
          <span>مشفّرة بالكامل</span>
        </div>
      </header>

      <main className="p-3 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="البحث في المحادثات..."
            className="w-full bg-white text-slate-800 placeholder-slate-400 pr-9 pl-4 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100">
          <ChatItem name="فريق دعم TTT" handle="@ttt_support" lastMessage="أهلاً بك! كيف يمكننا مساعدتك اليوم؟" time="10:30 ص" unread={1} />
          <ChatItem name="مبتكري Beta" handle="@beta_creators" lastMessage="تم إضافة ميزات جديدة لشبكة TTT" time="أمس" />
        </div>
      </main>

      <BottomNav activeTab="messages" />
    </div>
  );
}

function ChatItem({ name, handle, lastMessage, time, unread }: { name: string; handle: string; lastMessage: string; time: string; unread?: number }) {
  return (
    <div className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 font-bold text-white flex items-center justify-center text-xs shadow-sm">
          {name[0]}
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900">{name}</h4>
          <p className="text-[11px] text-slate-500 line-clamp-1">{lastMessage}</p>
        </div>
      </div>
      <div className="text-left space-y-1">
        <span className="text-[10px] text-slate-400">{time}</span>
        {unread && (
          <span className="w-4 h-4 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center mr-auto">
            {unread}
          </span>
        )}
      </div>
    </div>
  );
}