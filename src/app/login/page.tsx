"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
      if (error.message.includes("Invalid login credentials")) {
        setErrorMessage("البريد الإلكتروني أو كلمة السر غير صحيحة، يرجى التأكد وإعادة المحاولة.");
      } else if (error.message.includes("Email not confirmed")) {
        setErrorMessage("هذا البريد الإلكتروني يتطلب التأكيد أولاً.");
      } else {
        setErrorMessage(error.message);
      }
      setLoading(false);
    } else if (data.session) {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col justify-center items-center p-4 dir-rtl font-sans">
      
      {/* الكارت الرئيسي لتسجيل الدخول */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-orange-100 shadow-sm w-full max-w-sm space-y-5 text-right relative overflow-hidden">
        
        {/* اللوجو الرسمي لـ TTT البراند الأصلي */}
        <div className="flex flex-col items-center justify-center space-y-2 text-center pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-slate-900 tracking-wide">TTT Platform</h1>
            <p className="text-[11px] font-bold text-orange-600">تجربة اجتماعية أنيقة وسريعة</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center">تسجيل الدخول إلى حسابك الشخصي</p>

        {/* تنبيه الخطأ إن وجد */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] p-3 rounded-2xl text-center font-bold animate-fade-in">
            {errorMessage}
          </div>
        )}

        {/* نموذج تسجيل الدخول */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          {/* حقل البريد الإلكتروني */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block pr-1">البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@domain.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs pr-10 focus:outline-none focus:border-orange-500 focus:bg-white text-right transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          {/* حقل كلمة السر */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block pr-1">كلمة السر</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
          </div>

          {/* خيار تذكرني ونسيت كلمة السر */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-orange-500 cursor-pointer"
              />
              <span>تذكرني</span>
            </label>

            <Link href="/forgot-password" className="text-orange-600 font-bold hover:underline">
              نسيت كلمة السر؟
            </Link>
          </div>

          {/* زر تسجيل الدخول */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-xs flex justify-center items-center gap-2 disabled:opacity-50 shadow-md shadow-orange-500/20 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>تسجيل الدخول</span>}
          </button>
        </form>

        {/* فاصل */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-bold">أو</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        {/* الدخول بواسطة جوجل */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-xs flex justify-center items-center gap-2 transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>المتابعة باستخدام Google</span>
        </button>

        {/* رابط إنشاء حساب جديد */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500">ليس لديك حساب؟ </span>
          <Link href="/signup" className="text-orange-600 font-black hover:underline inline-flex items-center gap-0.5">
            <span>إنشاء حساب جديد</span>
            <ArrowLeft className="w-3 h-3" />
          </Link>
        </div>

      </div>

      {/* حقوق الملكية الخاصة بشركتك */}
      <footer className="mt-6 text-[11px] text-slate-400 font-bold">
        © 2026 TTT Platform by Beta. جميع الحقوق محفوظة.
      </footer>

    </div>
  );
}