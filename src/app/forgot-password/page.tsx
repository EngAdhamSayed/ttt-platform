"use client";

import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const otpRefs = [
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)
  ];
  const router = useRouter();

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setStep("otp");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage("كلمتا السر غير متطابقتين.");
      return;
    }

    setLoading(true);
    const token = otp.join("");

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: "recovery",
    });

    if (error) {
      setErrorMessage("رمز التحقق غير صحيح.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setErrorMessage(updateError.message);
      setLoading(false);
    } else {
      setStep("success");
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#faf8f5] text-slate-900 flex flex-col justify-between items-center p-4 dir-rtl font-sans select-none">
      <div></div>

      {step === "email" && (
        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm w-full max-w-sm space-y-4 text-right">
          <div className="flex flex-col items-center justify-center space-y-1 text-center">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-slate-900">إعادة تعيين كلمة السر</h1>
          </div>

          {errorMessage && <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-xl text-center font-bold">{errorMessage}</div>}

          <form onSubmit={handleSendResetEmail} className="space-y-3">
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs pr-10 focus:outline-none focus:border-orange-500 text-right"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>إرسال رمز إعادة التعيين</span>}
            </button>
          </form>
        </div>
      )}

      {step === "otp" && (
        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm w-full max-w-sm space-y-4 text-right">
          <h2 className="text-sm font-bold text-slate-900 text-center">أدخل الرمز وكلمة السر الجديدة</h2>

          {errorMessage && <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-xl text-center font-bold">{errorMessage}</div>}

          <div className="flex justify-center gap-2 dir-ltr py-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={otpRefs[i]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                className="w-9 h-11 text-center text-base font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            ))}
          </div>

          <form onSubmit={handleResetPassword} className="space-y-2.5">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="كلمة السر الجديدة"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs pr-9 focus:outline-none focus:border-orange-500 text-right"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>

            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تأكيد كلمة السر الجديدة"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs pr-9 focus:outline-none focus:border-orange-500 text-right"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>حفظ كلمة السر الجديدة</span>}
            </button>
          </form>
        </div>
      )}

      {step === "success" && (
        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm w-full max-w-sm text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-base font-black text-slate-900">تم تغيير كلمة السر بنجاح!</h2>
          <button onClick={() => router.push("/login")} className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl text-xs">
            تسجيل الدخول الآن
          </button>
        </div>
      )}

      <footer className="text-center space-y-1 pb-4">
        <p className="text-[10px] text-slate-500 font-bold">
          جميع الحقوق محفوظة TTT Platform by Beta 2026 ©
        </p>
      </footer>
    </div>
  );
}