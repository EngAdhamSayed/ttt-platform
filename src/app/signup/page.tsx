"use client";

import React, { useState } from "react";
import { User, AtSign, Mail, Lock, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !username) {
      setErrorMessage("برجاء ملء جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    } else {
      alert("تم إنشاء الحساب بنجاح! 🎉 جاري توجيهك للرئيسية...");
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 dir-rtl font-sans">
      <div className="w-full max-w-xs sm:max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-slate-200/60 space-y-4">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-white text-2xl mx-auto shadow-lg shadow-amber-500/30">
            T
          </div>
          <h1 className="text-xl font-bold text-slate-900">انضم إلى مجتمع TTT</h1>
          <p className="text-[11px] text-slate-500 font-medium">إحدى منصات الشركة الرائدة Beta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-3">
          
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 p-2 rounded-xl text-xs text-center font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block text-right">الاسم الشخصي</label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: مطور بيتا"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pr-9 pl-3 py-2.5 focus:outline-none focus:border-amber-500 focus:bg-white transition text-right"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block text-right">اسم المعرف (المستخدم)</label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: beta_developer"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pr-9 pl-3 py-2.5 focus:outline-none focus:border-amber-500 focus:bg-white transition text-right"
              />
              <AtSign className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>

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
            <label className="text-xs font-bold text-slate-700 block text-right">كلمة السر</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 حروف أو أرقام على الأقل"
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
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : (
              <>
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>إنشاء حساب جديد</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 pt-1">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-bold text-amber-600 hover:underline">
            تسجيل الدخول
          </Link>
        </p>

      </div>
    </div>
  );
}