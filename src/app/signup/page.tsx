"use client";

import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff, User, Sparkles, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "otp" | "welcome">("form");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const otpRefs = [
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)
  ];
  const router = useRouter();

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("كلمتا السر غير متطابقتين.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("كلمة السر يجب أن تكون 8 أحرف على الأقل.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: { full_name: `${firstName.trim()} ${lastName.trim()}` }
      }
    });

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

    if (newOtp.every((val) => val !== "")) {
      verifyOtp(newOtp.join(""));
    }
  };

  const verifyOtp = async (token: string) => {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: "signup",
    });

    if (error) {
      setErrorMessage("رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى.");
      setLoading(false);
    } else if (data.session) {
      setStep("welcome");
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#faf8f5] text-slate-900 flex flex-col justify-between items-center p-4 dir-rtl font-sans select-none">
      <div></div>

      {step === "form" && (
        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm w-full max-w-sm space-y-3.5 text-right">
          <div className="flex flex-col items-center justify-center space-y-1 text-center">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-slate-900">إنشاء حساب جديد</h1>
          </div>

          {errorMessage && (
            <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-xl text-center font-bold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSignupSubmit} className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="الاسم الأول"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-orange-500 text-right"
              />
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="الاسم الأخير"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-orange-500 text-right"
              />
            </div>

            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs pr-9 focus:outline-none focus:border-orange-500 text-right"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة السر (8 أحرف على الأقل)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs pr-9 pl-9 focus:outline-none focus:border-orange-500 text-right"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تأكيد كلمة السر"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs pr-9 focus:outline-none focus:border-orange-500 text-right"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-2 disabled:opacity-50 transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>إنشاء الحساب</span>}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">لديك حساب بالفعل؟ </span>
            <Link href="/login" className="text-orange-600 font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      )}

      {/* Step 2: 6 OTP Input Boxes */}
      {step === "otp" && (
        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm w-full max-w-sm space-y-4 text-center">
          <h2 className="text-sm font-bold text-slate-900">أدخل رمز التحقق المكون من 6 أرقام</h2>
          <p className="text-[11px] text-slate-500">اكتب رمز التحقق الذي تم إرساله إلى بريدك الإلكتروني</p>

          {errorMessage && (
            <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-xl font-bold">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-center gap-2 dir-ltr">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={otpRefs[i]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                className="w-10 h-12 text-center text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            ))}
          </div>

          {loading && <Loader2 className="w-5 h-5 animate-spin mx-auto text-orange-500" />}
        </div>
      )}

      {/* Step 3: Welcome Screen */}
      {step === "welcome" && (
        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm w-full max-w-sm text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h2 className="text-base font-black text-slate-900">أهلاً بك يا {firstName}! 👋</h2>
          <p className="text-xs text-slate-500">تم تسجيل حسابك بنجاح في TTT Platform.</p>
          <button
            onClick={() => {
              router.push("/");
              router.refresh();
            }}
            className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl text-xs"
          >
            الانتقال للرئيسية
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