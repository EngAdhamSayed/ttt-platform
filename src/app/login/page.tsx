"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_65%,_#e2e8f0)] p-6 dir-rtl font-sans">
      <div className="w-full max-w-sm rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-3xl font-black text-blue-600">TTT Platform</h1>
        <p className="mb-6 text-sm text-slate-500">تسجيل الدخول إلى شبكة التواصل الخاصة بك</p>
        <form onSubmit={handleLogin} className="space-y-3">
          <input type="email" placeholder="البريد الإلكتروني" onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500" />
          <input type="password" placeholder="كلمة السر" onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500" />
          <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700">تسجيل الدخول</button>
        </form>
        <div className="mt-4 text-center text-xs text-slate-500">
          ليس لديك حساب؟ <Link href="/signup" className="font-bold text-blue-600">إنشاء حساب</Link>
        </div>
      </div>
    </div>
  );
}