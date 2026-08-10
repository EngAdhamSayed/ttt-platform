"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // 1️⃣ تسجيل الدخول بالبريد وكلمة السر
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

  // 2️⃣ تسجيل الدخول السريع بحساب Google
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setErrorMessage("حدث خطأ أثناء الاتصال بحساب Google: " + error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#faf8f5] text-slate-900 flex flex-col justify-between items-center p-4 dir-rtl font-sans select-none">
      
      {/* هيدر علوي وهمي */}
      <div></div>

      {/* كارت تسجيل الدخول */}
      <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm w-full max-w-sm space-y-4 text-right my-auto">
        
        {/* اللوجو والشعار */}
        <div className="flex flex-col items-center justify-center space-y-1 text-center">
          <div className="w-12 h-12 relative mb-1">
            <Image src="/logo.png" alt="TTT Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-wide">تسجيل الدخول</h1>
          <p className="text-[10px] font-bold text-orange-600">أهلاً بك مجدداً في منصة TTT Platform</p>
        </div>

        {/* تنبيه بالخطأ إن وجد */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] p-2.5 rounded-2xl text-center font-bold">
            {errorMessage}
          </div>
        )}

        {/* نموذج تسجيل الدخول */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs pr-10 focus:outline-none focus:border-orange-500 focus:bg-white text-right transition"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs pr-10 pl-10 focus:outline-none focus:border-orange-500 focus:bg-white text-right transition"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
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
            disabled={loading || googleLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-xs flex justify-center items-center gap-2 disabled:opacity-50 transition shadow-md shadow-orange-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>تسجيل الدخول</span>}
          </button>
        </form>

        {/* فاصل */}
        <div className="relative flex py-0.5 items-center">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-bold">أو</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        {/* زرار جوجل */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-xs flex justify-center items-center gap-2 transition disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span>المتابعة بواسطة Google</span>
        </button>

        {/* رابط إنشاء حساب */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500">ليس لديك حساب؟ </span>
          <Link href="/signup" className="text-orange-600 font-bold hover:underline">
            إنشاء حساب جديد
          </Link>
        </div>

      </div>

      {/* الفوتر */}
      <footer className="text-center pb-4">
        <p className="text-[10px] text-slate-500 font-bold">
          جميع الحقوق محفوظة TTT Platform by Beta 2026 ©
        </p>
      </footer>

    </div>
  );
}