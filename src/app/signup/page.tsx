"use client";

import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Mail, Lock, User, Eye, EyeOff, Calendar, Users, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | "">("");

  // تاريخ الميلاد
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // مرحلة التسجيل: form | otp
  const [step, setStep] = useState<"form" | "otp">("form");

  // خانات الـ OTP المنفصلة (6 خانات)
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();

  // فحص شروط كلمة السر
  const pwdRules = {
    length: password.length >= 6,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
  const isPwdValid = pwdRules.length && pwdRules.hasUpper && pwdRules.hasNumber && pwdRules.hasSpecial;

  // التعامل مع إدخال خانات الـ OTP المنفصلة
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

  // التحقق من العمر (أقل من 18 سنة مرفوض)
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

  // 1️⃣ إرسال بيانات التسجيل
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // فحص السن
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

  // 2️⃣ التأكد من الـ OTP
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

  // 3️⃣ الدخول بـ Google
  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) setErrorMessage("خطأ في الاتصال بحساب بجوجل");
  };

  return (
    // h-screen: تجعل طول الـ div يساوي طول الشاشة بالضبط
    // overflow-hidden: تمنع ظهور أي شريط سكرول
    // justify-between: توزع العناصر (الفورم فوق والفوتر تحت) مع ترك مسافة بينهم
    <div className="h-screen w-screen overflow-hidden bg-[#faf8f5] text-slate-900 flex flex-col justify-between items-center p-6 dir-rtl font-sans select-none">
      <div></div>

      <div className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm w-full max-w-sm space-y-3 text-right my-auto overflow-y-auto max-h-[90vh] no-scrollbar">
        
        {/* اللوجو الرسمي بصورة */}
        <div className="flex flex-col items-center justify-center space-y-1 text-center">
          <div className="w-12 h-12 relative mb-1">
            <Image src="/logo.png" alt="TTT Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-wide">
            {step === "form" ? "إنشاء حساب جديد" : "تأكيد بريدك الإلكتروني"}
          </h1>
          <p className="text-[10px] font-bold text-orange-600">
            {step === "form" ? "مرحباً بك في منصة TTT Platform" : "أدخل كود الـ OTP المكون من 6 أرقام"}
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] p-2 rounded-2xl text-center font-bold">
            {errorMessage}
          </div>
        )}

        {step === "form" ? (
          <form onSubmit={handleSignup} className="space-y-2.5">
            {/* الاسم الأول والعائلة */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="الاسم الأول"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs pr-8 focus:outline-none focus:border-orange-500 focus:bg-white text-right"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="اسم العائلة"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs pr-8 focus:outline-none focus:border-orange-500 focus:bg-white text-right"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
              </div>
            </div>

            {/* البريد الإلكتروني */}
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs pr-8 focus:outline-none focus:border-orange-500 focus:bg-white text-right"
              />
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
            </div>

            {/* كلمة السر والعين */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة السر"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs pr-8 pl-8 focus:outline-none focus:border-orange-500 focus:bg-white text-right"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-2.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* قائمة شروط كلمة السر التفاعلية */}
            {password.length > 0 && !isPwdValid && (
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl space-y-1.5 text-[10px] transition-all">
                <p className="font-bold text-slate-700 mb-1">شروط الأمان لكلمة السر:</p>
                
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full transition-colors ${pwdRules.length ? "bg-orange-500" : "bg-slate-300"}`}></span>
                  <span className={pwdRules.length ? "text-orange-600 font-bold" : "text-slate-500"}>6 أحرف/أرقام على الأقل</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full transition-colors ${pwdRules.hasUpper ? "bg-orange-500" : "bg-slate-300"}`}></span>
                  <span className={pwdRules.hasUpper ? "text-orange-600 font-bold" : "text-slate-500"}>حرف كبير واحد على الأقل (A-Z)</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full transition-colors ${pwdRules.hasNumber ? "bg-orange-500" : "bg-slate-300"}`}></span>
                  <span className={pwdRules.hasNumber ? "text-orange-600 font-bold" : "text-slate-500"}>رقم واحد على الأقل (0-9)</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full transition-colors ${pwdRules.hasSpecial ? "bg-orange-500" : "bg-slate-300"}`}></span>
                  <span className={pwdRules.hasSpecial ? "text-orange-600 font-bold" : "text-slate-500"}>رمز خاص مثل (!@#$%^&*)</span>
                </div>
              </div>
            )}

            {/* تاريخ الميلاد */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-orange-500" />
                <span>تاريخ الميلاد (يجب أن تكون 18 عاماً أو أكثر)</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="number"
                  required
                  min={1}
                  max={31}
                  placeholder="اليوم"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-center focus:border-orange-500"
                />
                <input
                  type="number"
                  required
                  min={1}
                  max={12}
                  placeholder="الشهر"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-center focus:border-orange-500"
                />
                <input
                  type="number"
                  required
                  min={1940}
                  max={2010}
                  placeholder="السنة"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-center focus:border-orange-500"
                />
              </div>
            </div>

            {/* تحديد النوع */}
            <div className="space-y-1 pt-0.5">
              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                <Users className="w-3 h-3 text-orange-500" />
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
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-2xl text-xs flex justify-center items-center gap-2 transition shadow-md shadow-orange-500/20 disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>إنشاء الحساب واستلام الرمز</span>}
            </button>
          </form>
        ) : (
          /* خانات كود التحقق الـ OTP المنفصلة */
          <form onSubmit={handleVerifyOtp} className="space-y-4 py-2">
            <p className="text-[11px] text-center text-slate-500">
              تم إرسال رمز التحقق إلى بريدك الإلكتروني: <br />
              <span className="font-bold text-slate-800 dir-ltr inline-block mt-0.5">{email}</span>
            </p>

            {/* 6 خانات منفصلة */}
            <div className="flex justify-between gap-1.5 dir-ltr">
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
                  className="w-10 h-12 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-black focus:outline-none focus:border-orange-500 focus:bg-white text-slate-900 transition
                  w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm focus:outline-none focus:border-orange-500 focus:bg-white text-right pr-10 dir-ltr text-left"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-xs flex justify-center items-center gap-2 transition shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>تأكيد الرمز والدخول</span>}
            </button>

            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full text-[11px] text-slate-400 hover:underline text-center block"
            >
              تعديل البيانات أو الإيميل
            </button>
          </form>
        )}

        {step === "form" && (
          <>
            <div className="relative flex py-0.5 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-bold">أو</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2 rounded-2xl text-xs flex justify-center items-center gap-2 transition"
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

      <footer className="text-center space-y-1 pb-2">
        <p className="text-[10px] text-slate-500 font-bold">جميع الحقوق محفوظة TTT Platform by Beta 2026 ©</p>
      </footer>
    </div>
  );
}