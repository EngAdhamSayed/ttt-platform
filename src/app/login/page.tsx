"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage("البريد الإلكتروني أو كلمة السر غير صحيحة");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 dir-rtl font-sans">
      <div className="w-full max-w-xs sm:max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-slate-200/60 space-y-5">
        
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-white text-2xl mx-auto shadow-lg shadow-amber-500/30">
            T
          </div>
          <h1 className="text-xl font-bold text-slate-900">تسجيل الدخول إلى TTT</h1>
          <p className="text-[11px] text-slate-500 font-medium">إحدى منصات الشركة الرائدة Beta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 p-2.5 rounded-xl text-xs text-center font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block text-right">البريد الإلكتروني</label>
            <div className="relative flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@beta.com"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pr-9 pl-3 py-2.5 focus:outline-none focus:border-amber-500 focus:bg-white transition text-right"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <a href="#" className="text-[10px] text-amber-600 font-semibold hover:underline">نسيت كلمة السر؟</a>
              <label className="font-bold text-slate-700">كلمة السر</label>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pr-9 pl-9 py-2.5 focus:outline-none focus:border-amber-500 focus:bg-white transition text-right"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <span>تسجيل الدخول</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 py-2 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>مشفر بالكامل طبقاً لمعايير الأمان</span>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 pt-1">
          ليس لديك حساب؟{" "}
          <Link href="/signup" className="font-bold text-amber-600 hover:underline">
            إنشاء حساب جديد
          </Link>
        </p>

      </div>
    </div>
  );
}