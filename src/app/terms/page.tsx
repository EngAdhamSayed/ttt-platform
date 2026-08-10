"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#faf8f5] text-slate-900 p-4 dir-rtl font-sans flex flex-col justify-between max-w-md mx-auto select-none">
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 border-b border-orange-100 pb-3">
          <Link href="/login" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition">
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <h1 className="text-base font-black text-slate-900">شروط الاستخدام</h1>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-orange-100 shadow-sm space-y-3 text-xs leading-relaxed text-slate-600 text-right max-h-[75vh] overflow-y-auto no-scrollbar">
          <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-1">اتفاقية شروط وأحكام الاستخدام</h2>

          <p>باستخدامك لمنصة <strong>TTT Platform</strong> فإنك توافق التام على الالتزام بالشروط والأحكام التالية:</p>

          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800">1. الأهلية العمرية:</h3>
            <p className="text-[11px] text-slate-500">يجب أن يكون عمر المستخدم 18 عاماً أو أكثر للتمكن من إنشاء حساب واستخدام خيارات المنصة.</p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800">2. السلوك العام والمسؤولية:</h3>
            <p className="text-[11px] text-slate-500">يلتزم المستخدم بعدم نشر أي محتوى يسيء للآخرين أو يخالف القوانين العامة. يتحمل المستخدم كامل المسؤولية عن النشاط الصادر من حسابه.</p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800">3. إيقاف الحسابات:</h3>
            <p className="text-[11px] text-slate-500">تحتفظ إدارة TTT Platform بحق تعليق أو إغلاق أي حساب يخالف شروط الاستخدام أو يحاول اختراق أمان الأبلكيشن.</p>
          </div>
        </div>
      </div>

      <footer className="text-center py-2 text-[10px] text-slate-400 font-bold">
        جميع الحقوق محفوظة TTT Platform by Beta 2026 ©
      </footer>
    </div>
  );
}