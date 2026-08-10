"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#faf8f5] text-slate-900 p-4 dir-rtl font-sans flex flex-col justify-between max-w-md mx-auto select-none">
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 border-b border-orange-100 pb-3">
          <Link href="/login" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition">
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
            <h1 className="text-base font-black text-slate-900">سياسة الخصوصية</h1>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-orange-100 shadow-sm space-y-3 text-xs leading-relaxed text-slate-600 text-right max-h-[75vh] overflow-y-auto no-scrollbar">
          <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-1">سياسة حماية البيانات - TTT Platform</h2>
          
          <p>أهلاً بك في منصة <strong>TTT Platform</strong>. نحن نولي خصوصيتك وحماية بياناتك أولوية قصوى.</p>

          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800">1. البيانات التي نجمعها:</h3>
            <p className="text-[11px] text-slate-500">نجمع البيانات الأساسية التي تقدمها عند إنشاء حسابك مثل: الاسم الكامل، البريد الإلكتروني، النوع، وتاريخ الميلاد لتأكيد الأهلية العمرية (18 عاماً فأكثر).</p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800">2. كيفية استخدام البيانات:</h3>
            <p className="text-[11px] text-slate-500">تستخدم البيانات لتأمين حسابك، وتخصيص تجربتك داخل المنصة، وإرسال رموز التحقق (OTP) ولا يتم مشاركتها إطلاقاً مع أي أطراف إعلانية خارجية.</p>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800">3. حماية الحساب والأمان:</h3>
            <p className="text-[11px] text-slate-500">جميع كلمات السر والبيانات الحساسة يتم تشفيرها باستخدام تقنيات Supabase الأمنية المتطورة لضمان عدم وصول أي شخص غير مصرح له إليها.</p>
          </div>
        </div>
      </div>

      <footer className="text-center py-2 text-[10px] text-slate-400 font-bold">
        جميع الحقوق محفوظة TTT Platform by Beta 2026 ©
      </footer>
    </div>
  );
}