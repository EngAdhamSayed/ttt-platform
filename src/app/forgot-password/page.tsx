"use client";

import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPwdFocused, setIsPwdFocused] = useState(false);
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();

  const pwdRules = {
    length: newPassword.length >= 6,
    hasUpper: /[A-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
  };
  const isPwdValid = pwdRules.length && pwdRules.hasUpper && pwdRules.hasNumber && pwdRules.hasSpecial;

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

    if (error) {
      setErrorMessage(error.message);
    } else {
      setStep("verify");
    }
    setLoading(false);
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isPwdValid) {
      setErrorMessage("يرجى استيفاء جميع شروط كلمة السر الجديدة.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("كلمتا السر غير متطابقتين.");
      return;
    }

    setLoading(true);
    const token = otpDigits.join("");

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token,
      type: "recovery",
    });

    if (verifyError) {
      setErrorMessage("رمز التحقق غير صحيح أو انتهت صلاحيته.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.trim(),
    });

    if (updateError) {
      setErrorMessage(updateError.message);
    } else {
      alert("تم إعادة تعيين كلمة السر بنجاح!");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#faf8f5] text-slate-900 flex flex-col justify-center items-center gap-3 p-4 dir-rtl font-sans select-none">

      <div className="bg-white p-7 rounded-3xl border border-orange-100 shadow-md w-full max-w-sm space-y-4 text-right">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="w-16 h-16 relative mb-1">
            <Image src="/logo.png" alt="TTT Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-wide">استعادة كلمة السر</h1>
          <p className="text-xs font-bold text-orange-600">
            {step === "request" ? "أدخل إيميلك لاستلام رمز الاستعادة" : "أدخل الرمز وكلمة السر الجديدة"}
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-2xl text-center font-bold">
            {errorMessage}
          </div>
        )}

        {step === "request" ? (
          <form onSubmit={handleRequestReset} className="space-y-3.5">
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm pr-11 focus:outline-none focus:border-orange-500 focus:bg-white text-right font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400"
              />
              <Mail className="w-5 h-5 text-slate-400 absolute right-3.5 top-4" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl text-xs flex justify-center items-center gap-2 transition shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>إرسال رمز الاستعادة</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndReset} className="space-y-3.5">
            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-600">أدخل كود الـ OTP (6 أرقام):</label>
              
              {/* تم حسم الاتجاه هنا بـ dir="ltr" صريح لمنع انعكاس الـ Flexbox */}
              <div dir="ltr" className="flex flex-row justify-between gap-1.5 [direction:ltr]">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputsRef.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-10 h-12 bg-white border-2 border-slate-300 rounded-xl text-center text-xl font-black text-slate-900 focus:outline-none focus:border-orange-500 shadow-sm transition"
                  />
                ))}
              </div>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onFocus={() => setIsPwdFocused(true)}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="كلمة السر الجديدة"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm pr-11 pl-11 focus:outline-none focus:border-orange-500 focus:bg-white text-right font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400"
              />
              <Lock className="w-5 h-5 text-slate-400 absolute right-3.5 top-4" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-4 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {(isPwdFocused || newPassword.length > 0) && !isPwdValid && (
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl space-y-1.5 text-xs transition-all text-right">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${pwdRules.length ? "bg-orange-500" : "bg-slate-300"}`}></span>
                  <span className={pwdRules.length ? "text-orange-600 font-bold" : "text-slate-500"}>6 أحرف/أرقام على الأقل</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${pwdRules.hasUpper ? "bg-orange-500" : "bg-slate-300"}`}></span>
                  <span className={pwdRules.hasUpper ? "text-orange-600 font-bold" : "text-slate-500"}>حرف كبير (A-Z)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${pwdRules.hasNumber ? "bg-orange-500" : "bg-slate-300"}`}></span>
                  <span className={pwdRules.hasNumber ? "text-orange-600 font-bold" : "text-slate-500"}>رقم (0-9)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${pwdRules.hasSpecial ? "bg-orange-500" : "bg-slate-300"}`}></span>
                  <span className={pwdRules.hasSpecial ? "text-orange-600 font-bold" : "text-slate-500"}>رمز خاص (!@#$)</span>
                </div>
              </div>
            )}

            {isPwdValid && (
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="تأكيد كلمة السر الجديدة"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm pr-11 pl-11 focus:outline-none focus:border-orange-500 focus:bg-white text-right font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400"
                />
                <Lock className="w-5 h-5 text-slate-400 absolute right-3.5 top-4" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3.5 top-4 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl text-xs flex justify-center items-center gap-2 transition shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>تحديث كلمة السر</span>}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <Link href="/login" className="text-orange-600 font-bold hover:underline flex items-center justify-center gap-1">
            <ArrowRight className="w-4 h-4" />
            <span>العودة لصفحة تسجيل الدخول</span>
          </Link>
        </div>
      </div>

      <footer className="text-center">
        <p className="text-[10px] text-slate-500 font-bold">جميع الحقوق محفوظة TTT Platform by Beta 2026 ©</p>
      </footer>
    </div>
  );
}