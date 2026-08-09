"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setErrorMessage("البريد الإلكتروني أو كلمة السر غير صحيحة.");
      setLoading(false);
    } else if (data.session) {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#faf8f5] text-slate-900 flex flex-col justify-between items-center p-4 dir-rtl font-sans select-none">
      
      <div></div>

      {/* Login Card */}
      <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm w-full max-w-sm space-y-4 text-right">
        <div className="flex flex-col items-center justify-center space-y-1.5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-wide">TTT Platform</h1>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] p-2.5 rounded-2xl text-center font-bold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs pr-10 focus:outline-none focus:border-orange-500 text-right"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs pr-10 pl-10 focus:outline-none focus:border-orange-500 text-right"
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

          <div className="flex justify-end text-[11px]">
            <Link href="/forgot-password" className="text-orange-600 font-bold hover:underline">
              نسيت كلمة السر؟
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-xs flex justify-center items-center gap-2 disabled:opacity-50 transition shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>تسجيل الدخول</span>}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-xs flex justify-center items-center gap-2 transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>المتابعة باستخدام Google</span>
        </button>

        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500">ليس لديك حساب؟ </span>
          <Link href="/signup" className="text-orange-600 font-bold hover:underline">
            إنشاء حساب جديد
          </Link>
        </div>
      </div>

      {/* Footer المخصص بالتحديد كما الملاحظة */}
      <footer className="text-center space-y-1 pb-4">
        <p className="text-[10px] text-slate-500 font-bold">
          جميع الحقوق محفوظة TTT Platform by Beta 2026 ©
        </p>
        <div className="flex justify-center gap-3 text-[10px] text-slate-400 font-bold">
          <Link href="/privacy" className="hover:underline">سياسة الخصوصية</Link>
          <span>•</span>
          <Link href="/terms" className="hover:underline">شروط الاستخدام</Link>
        </div>
      </footer>

    </div>
  );
}