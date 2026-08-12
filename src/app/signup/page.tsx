"use client";

import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail, Lock, User, Eye, EyeOff, Calendar, Users } from "lucide-react";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPwdFocused, setIsPwdFocused] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | "">("");

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [step, setStep] = useState<"form" | "otp">("form");

  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();

  const pwdRules = {
    length: password.length >= 6,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
  const isPwdValid = pwdRules.length && pwdRules.hasUpper && pwdRules.hasNumber && pwdRules.hasSpecial;

  const arabicMonths = [
    { value: "01", label: "يناير (1)" },
    { value: "02", label: "فبراير (2)" },
    { value: "03", label: "مارس (3)" },
    { value: "04", label: "أبريل (4)" },
    { value: "05", label: "مايو (5)" },
    { value: "06", label: "يونيو (6)" },
    { value: "07", label: "يوليو (7)" },
    { value: "08", label: "أغسطس (8)" },
    { value: "09", label: "سبتمبر (9)" },
    { value: "10", label: "أكتوبر (10)" },
    { value: "11", label: "نوفمبر (11)" },
    { value: "12", label: "ديسمبر (12)" },
  ];

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

  const calculateAge = () => {
    if (!day || !month || !year) return 0;
    const birthDate = new Date(Number(year), Number(month) - 1, Number(day));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const age = calculateAge();
    if (age < 18) {
      setErrorMessage("عذراً، يجب أن يكون عمرك 18 عاماً أو أكثر للتسجيل في المنصة.");
      return;
    }

    if (!gender) {
      setErrorMessage("يرجى اختيار النوع (ذكر / أنثى).");
      return;
    }

    if (!isPwdValid) {
      setErrorMessage("يرجى استيفاء جميع شروط كلمة السر.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("كلمتا السر غير متطابقتين.");
      return;
    }

    setLoading(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const birthDateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          full_name: fullName,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          gender: gender,
          birth_date: birthDateStr,
        },
      },
    });

    if (error) {
      setErrorMessage("حدث خطأ أثناء التسجيل: " + error.message);
      setLoading(false);
    } else {
      setStep("otp");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const token = otpDigits.join("");
    if (token.length < 6) {
      setErrorMessage("يرجى إدخال رمز التحقق كاملاً المكون من 6 أرقام.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token,
      type: "signup",
    });

    if (error) {
      setErrorMessage("رمز التحقق غير صحيح أو انتهت صلاحيته.");
      setLoading(false);
    } else if (data.session) {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) setErrorMessage("خطأ في الاتصال بحساب جوجل");
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#faf8f5] text-slate-900 flex flex-col justify-center items-center gap-2 p-3 dir-rtl font-sans select-none">

      <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-md w-full max-w-sm space-y-3 text-right max-h-[85vh] overflow-y-auto no-scrollbar">
        
        <div className="flex flex-col items-center justify-center space-y-1 text-center">
          <div className="w-12 h-12 relative mb-0.5">
            <Image src="/logo.png" alt="TTT Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-wide">
            {step === "form" ? "إنشاء حساب جديد" : "تأكيد بريدك الإلكتروني"}
          </h1>
          <p className="text-xs font-bold text-orange-600">
            {step === "form" ? "مرحباً بك في منصة TTT Platform" : "أدخل كود الـ OTP المكون من 6 أرقام"}
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-2.5 rounded-2xl text-center font-bold">
            {errorMessage}
          </div>
        )}

        {step === "form" ? (
          <form onSubmit={handleSignup} className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="الاسم الأول"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs pr-8 focus:outline-none focus:border-orange-500 focus:bg-white text-right font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="اسم العائلة"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs pr-8 focus:outline-none focus:border-orange-500 focus:bg-white text-right font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
              </div>
            </div>

            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs pr-8 focus:outline-none focus:border-orange-500 focus:bg-white text-right font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onFocus={() => setIsPwdFocused(true)}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة السر"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs pr-8 pl-8 focus:outline-none focus:border-orange-500 focus:bg-white text-right font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-2.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {(isPwdFocused || password.length > 0) && !isPwdValid && (
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl space-y-1.5 text-xs transition-all text-right">
                <p className="font-bold text-slate-700 mb-1">شروط الأمان لكلمة السر:</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full transition-colors ${pwdRules.length ? "bg-orange-500" : "bg-slate-300"}`}></span>
                  <span className={pwdRules.length ? "text-orange-600 font-bold" : "text-slate-500"}>6 أحرف/أرقام على الأقل</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full transition-colors ${pwdRules.hasUpper ? "bg-orange-500" : "bg-slate-300"}`}></span>
                  <span className={pwdRules.hasUpper ? "text-orange-600 font-bold" : "text-slate-500"}>حرف كبير واحد على الأقل (A-Z)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full transition-colors ${pwdRules.hasNumber ? "bg-orange-500" : "bg-slate-300"}`}></span>
                  <span className={pwdRules.hasNumber ? "text-orange-600 font-bold" : "text-slate-500"}>رقم واحد على الأقل (0-9)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full transition-colors ${pwdRules.hasSpecial ? "bg-orange-500" : "bg-slate-300"}`}></span>
                  <span className={pwdRules.hasSpecial ? "text-orange-600 font-bold" : "text-slate-500"}>رمز خاص مثل (!@#$%^&*)</span>
                </div>
              </div>
            )}

            {isPwdValid && (
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تأكيد كلمة السر"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs pr-8 pl-8 focus:outline-none focus:border-orange-500 focus:bg-white text-right font-bold text-slate-800 placeholder:font-medium placeholder:text-slate-400"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-2.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            <div className="space-y-1 text-right">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                <span>تاريخ الميلاد (يجب ألا يقل عن 18 عاماً)</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <select
                  required
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-center font-bold focus:border-orange-500 text-slate-800"
                >
                  <option value="">اليوم</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  required
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-center font-bold focus:border-orange-500 text-slate-800"
                >
                  <option value="">الشهر</option>
                  {arabicMonths.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>

                <input
                  type="number"
                  required
                  min={1940}
                  max={2010}
                  placeholder="السنة"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-center font-bold focus:border-orange-500 text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1 pt-0.5 text-right">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-orange-500" />
                <span>النوع</span>
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`p-2 rounded-xl border font-bold transition ${gender === "male" ? "bg-orange-500 text-white border-orange-500" : "bg-slate-50 border-slate-200 text-slate-600"}`}
                >
                  ذكر
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`p-2 rounded-xl border font-bold transition ${gender === "female" ? "bg-orange-500 text-white border-orange-500" : "bg-slate-50 border-slate-200 text-slate-600"}`}
                >
                  أنثى
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-xs flex justify-center items-center gap-2 transition shadow-md shadow-orange-500/20 disabled:opacity-50 mt-1"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>إنشاء الحساب واستلام الرمز</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 py-2">
            <p className="text-xs text-center text-slate-600 leading-relaxed">
              تم إرسال رمز التحقق إلى بريدك الإلكتروني: <br />
              <span dir="ltr" className="font-bold text-slate-900 inline-block mt-0.5">{email}</span>
            </p>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl text-xs flex justify-center items-center gap-2 transition shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>تأكيد الرمز والدخول</span>}
            </button>

            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full text-xs text-slate-500 hover:underline text-center block font-bold"
            >
              تعديل البيانات أو الإيميل
            </button>
          </form>
        )}

        {step === "form" && (
          <>
            <div className="relative flex py-0.5 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-2 text-xs text-slate-400 font-bold">أو</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-xs flex justify-center items-center gap-2 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>المتابعة بواسطة Google</span>
            </button>
          </>
        )}

        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500">لديك حساب بالفعل؟ </span>
          <Link href="/login" className="text-orange-600 font-bold hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>

      <footer className="text-center">
        <p className="text-[10px] text-slate-500 font-bold">جميع الحقوق محفوظة TTT Platform by Beta 2026 ©</p>
      </footer>
    </div>
  );
}