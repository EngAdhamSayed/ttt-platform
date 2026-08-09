"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 p-6 dir-rtl font-sans flex flex-col justify-between max-w-md mx-auto">
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-2 border-b border-orange-100 pb-4">
          <Link href="/login" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-orange-500" />
            <h1 className="text-lg font-black text-slate-900">سياسة الخصوصية</h1>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm space-y-3 text-xs leading-relaxed text-slate-600 text-right">
          <p className="font-bold text-slate-900 text-sm">سياسة الخصوصية وحماية البيانات - TTT Platform</p>
          <p>نحن في TTT Platform نلتزم بحماية خصوصية بيانك وحسابك الشخصي ببيئة آمنة ومشفرة بالكامل.</p>
          <p className="text-slate-400 italic">(سيتم إضافة النص والتفاصيل القانونية الرسمية الكاملة هنا لاحقاً).</p>
        </div>
      </div>

      <footer className="text-center py-4 text-[10px] text-slate-400 font-bold">
        جميع الحقوق محفوظة TTT Platform by Beta 2026 ©
      </footer>
    </div>
  );
}