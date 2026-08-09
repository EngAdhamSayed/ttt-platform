"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, Sparkles, KeyRound, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  // إرسال كود استعادة كلمة السر
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

    if (error) {
      setErrorMessage(error.message);
    } else {
      setMessage("تم إرسال رمز/رابط إعادة التعيين إلى بريدك الإلكتروني.");
      setStep("verify");
    }
    setLoading(false);
  };

  // تأكيد الرمز وتعديل كلمة المرور
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // 1. تأكيد الرمز
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otpCode.trim(),
      type: "recovery",
    });

    if (verifyError) {
      setErrorMessage("رمز إعادة التعيين غير صحيح.");
      setLoading(false);
      return;
    }

    // 2. تحديث كلمة المرور
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.trim(),
    });

    if (updateError) {
      setErrorMessage(updateError.message);
    } else {
      alert("تم تغيير كلمة السر بنجاح! يمكنك الآن تسجيل الدخول.");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#faf8f5] text-slate-900 flex flex-col justify-between items-center p-4 dir-rtl font-sans select-none">
      <div></div>

      <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm w-full max-w-sm space-y-4 text-right my-auto">
        <div className="flex flex-col items-center justify-center space-y-1.5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-wide">استعادة كلمة السر</h1>
          <p className="text-[10px] font-bold text-orange-600">أدخل إيميلك لاستلام كود إعادة التعيين</p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] p-2.5 rounded-2xl text-center font-bold">
            {errorMessage}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-100 text-green-700 text-[11px] p-2.5 rounded-2xl text-center font-bold">
            {message}
          </div>
        )}

        {step === "request" ? (
          <form onSubmit={handleRequestReset} className="space-y-3">
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني المسجل"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs pr-10 focus:outline-none focus:border-orange-500 focus:bg-white text-right transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-xs flex justify-center items-center gap-2 transition shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>إرسال كود الاستعادة</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndReset} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="كود الـ OTP (6 أرقام)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-center tracking-widest font-bold focus:outline-none focus:border-orange-500 focus:bg-white transition"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>

            <div className="relative">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="كلمة السر الجديدة"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs pr-10 focus:outline-none focus:border-orange-500 focus:bg-white text-right transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-xs flex justify-center items-center gap-2 transition shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>حفظ كلمة السر الجديدة</span>}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <Link href="/login" className="text-orange-600 font-bold hover:underline flex items-center justify-center gap-1">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لصفحة تسجيل الدخول</span>
          </Link>
        </div>
      </div>

      <footer className="text-center space-y-1 pb-4">
        <p className="text-[10px] text-slate-500 font-bold">جميع الحقوق محفوظة TTT Platform by Beta 2026 ©</p>
      </footer>
    </div>
  );
}