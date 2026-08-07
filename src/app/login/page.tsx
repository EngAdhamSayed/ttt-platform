"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      alert("خطأ في بيانات الدخول: " + error.message);
    } else if (data.session) {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 dir-rtl font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full max-w-sm space-y-4 text-right">
        <h1 className="text-2xl font-black text-blue-600 tracking-wider">facebook</h1>
        <p className="text-xs text-slate-500">تسجيل الدخول إلى حسابك</p>

        <form onSubmit={handleLogin} className="space-y-3">
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs pr-10 focus:outline-none focus:border-blue-600 text-right"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة السر"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs pr-10 pl-10 focus:outline-none focus:border-blue-600 text-right"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2 disabled:opacity-50 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>تسجيل الدخول</span>}
          </button>
        </form>

        <div className="flex justify-between items-center text-[11px] pt-2 border-t border-slate-100">
          <Link href="/forgot-password" className="text-slate-500 hover:underline">
            نسيت كلمة السر؟
          </Link>
          <Link href="/signup" className="text-blue-600 font-bold hover:underline">
            إنشاء حساب جديد
          </Link>
        </div>
      </div>
    </div>
  );
}