"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) alert(error.message);
    else alert("تم التسجيل! تحقق من إيميلك.");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_65%,_#e2e8f0)] p-6 dir-rtl font-sans">
      <div className="w-full max-w-sm rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-2xl font-black text-slate-900">إنشاء حساب جديد</h2>
        <p className="mb-6 text-sm text-slate-500">ابدأ رحلتك مع منصة TTT اليوم</p>
        <form onSubmit={handleSignup} className="space-y-3">
          <input type="text" placeholder="الاسم الكامل" onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500" />
          <input type="email" placeholder="البريد الإلكتروني" onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500" />
          <input type="password" placeholder="كلمة السر" onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500" />
          <button type="submit" className="w-full rounded-xl bg-green-600 py-3 font-bold text-white transition hover:bg-green-700">إنشاء الحساب</button>
        </form>
        <div className="mt-4 text-center text-xs text-slate-500">
          لديك حساب بالفعل؟ <Link href="/login" className="font-bold text-blue-600">تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}