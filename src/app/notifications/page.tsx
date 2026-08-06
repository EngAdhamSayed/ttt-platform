"use client";

import React from "react";
import { Heart, MessageSquare, UserPlus, ShieldAlert, Home, Compass, PlusCircle, Bell, User } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20 max-w-md mx-auto">
      
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200">
        <h1 className="text-sm font-bold text-slate-900">التنبيهات الإشعارية</h1>
      </header>

      <main className="p-3 space-y-2">
        <NotificationItem 
          icon={<Heart className="w-4 h-4 text-rose-500" />}
          title="أعجب مستخدم TTT بمنشورك"
          time="منذ 10 دقائق"
          content="أهلاً بك في TTT! المنصة التي أُسست لتكون..."
        />
        <NotificationItem 
          icon={<UserPlus className="w-4 h-4 text-amber-500" />}
          title="قام أحمد بمتابعتك"
          time="منذ ساعة"
        />
        <NotificationItem 
          icon={<MessageSquare className="w-4 h-4 text-blue-500" />}
          title="علق فريق TTT على منشورك"
          time="منذ 3 ساعات"
          content="شكراً لمشاركتك الفعالة في التجربة الأولى!"
        />
        <NotificationItem 
          icon={<ShieldAlert className="w-4 h-4 text-emerald-500" />}
          title="تم تأمين حسابك بنجاح"
          time="منذ يوم"
          content="بياناتك وحسابك مشفرة بالكامل طبقاً لمعايير Beta."
        />
      </main>

      <BottomNav activeTab="notifications" />
    </div>
  );
}

function NotificationItem({ icon, title, time, content }: { icon: React.ReactNode; title: string; time: string; content?: string }) {
  return (
    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex gap-3 items-start">
      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-slate-900">{title}</h4>
          <span className="text-[10px] text-slate-400">{time}</span>
        </div>
        {content && <p className="text-[11px] text-slate-500 line-clamp-1">{content}</p>}
      </div>
    </div>
  );
}