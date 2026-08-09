"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 p-6 dir-rtl font-sans flex flex-col justify-between max-w-md mx-auto">
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-2 border-b border-orange-100 pb-4">
          <Link href="/login" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-500" />
            <h1 className="text-lg font-black text-slate-900">شروط الاستخدام</h1>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm space-y-3 text-xs leading-relaxed text-slate-600 text-right">
          <p className="font-bold text-slate-900 text-sm">اتفاقية شروط وأحكام الاستخدام - TTT Platform</p>
          <p>باستخدامك لمنصة TTT Platform فإنك توافق على الالتزام بقواعد مجتمعنا واحترام جيرانك وأصدقائك في المنصة.</p>
          <p className="text-slate-400 italic">(سيتم إضافة البنود والشروط الرسمية المكتملة هنا لاحقاً).</p>
        </div>
      </div>

      <footer className="text-center py-4 text-[10px] text-slate-400 font-bold">
        جميع الحقوق محفوظة TTT Platform by Beta 2026 ©
      </footer>
    </div>
  );
}