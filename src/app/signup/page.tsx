"use client";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, UserRoundPlus, Send } from "lucide-react";

const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const router = useRouter();

  const normalizeEmail = (value: string) => value.trim().toLowerCase();
  const generateCode = () => `${Math.floor(100000 + Math.random() * 900000)}`;

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedEmail = normalizeEmail(email);
    const safeFullName = fullName.trim();

    if (!normalizedEmail || !password || !safeFullName) {
      setMessage("يرجى تعبئة جميع الحقول أولًا.");
      return;
    }

    if (!passwordPolicy.test(password)) {
      setMessage("كلمة المرور قوية يجب أن تكون 8 أحرف على الأقل وتحتوي على حروف كبيرة وصغيرة وأرقام ورموز.");
      return;
    }

    setLoading(true);
    setMessage("");

    const code = generateCode();
    const expiry = Date.now() + 3 * 60 * 1000;
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: safeFullName,
          verification_code: code,
          is_verified: false,
          verification_expires_at: expiry,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").upsert(
        {
          id: userId,
          full_name: safeFullName,
          avatar_url: null,
        },
        { onConflict: "id" },
      );
    }

    await fetch("/api/verify/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        fullName: safeFullName,
        code,
        expiresAt: expiry,
      }),
    });

    setGeneratedCode(code);
    setExpiresAt(expiry);
    setVerificationCode("");
    setStep("verify");
    setMessage(`تم إنشاء الحساب بنجاح. تم إرسال رمز التحقق إلى بريدك الإلكتروني، ويظل صالحًا لمدة 3 دقائق.`);
    setLoading(false);
  };

  const handleVerifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!generatedCode || !verificationCode.trim()) {
      setMessage("أدخل الرمز المكوّن من 6 أرقام أولًا.");
      return;
    }

    if (!expiresAt || Date.now() > expiresAt) {
      setMessage("انتهت صلاحية الرمز. يرجى إنشاء حساب جديد أو طلب رمز جديد.");
      return;
    }

    if (verificationCode.trim() !== generatedCode) {
      setMessage("الرمز غير صحيح. يرجى التأكد من الرقم الذي ظهر لك.");
      return;
    }

    setLoading(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("لم نتمكن من العثور على الحساب الحالي. حاول تسجيل الدخول مرة أخرى.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        is_verified: true,
        verification_code: null,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: fullName.trim(),
        avatar_url: null,
      },
      { onConflict: "id" },
    );

    setMessage("تم التحقق من الحساب بنجاح. يمكنك الآن تسجيل الدخول.");
    setLoading(false);
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_#fff7ed,_#fffbeb_65%,_#fed7aa)] p-6 dir-rtl font-sans">
      <div className="w-full max-w-sm rounded-[1.75rem] border border-orange-200 bg-white p-6 shadow-[0_16px_45px_rgba(249,115,22,0.12)]">
        <div className="mb-5 flex items-center gap-2 text-orange-600">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">إنشاء حساب جديد</h2>
            <p className="text-[11px] text-slate-500">ابدأ رحلتك مع منصة TTT اليوم</p>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-orange-100 bg-orange-50 px-3 py-2 text-[11px] text-orange-700">
          ✨ عند إنشاء الحساب، سنرسل لك رمز تحقق إلى بريدك الإلكتروني. يبقى صالحًا لمدة 3 دقائق فقط.
        </div>
        {step === "signup" ? (
          <form onSubmit={handleSignup} className="space-y-3">
            <input required type="text" placeholder="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-orange-500" />
            <input required type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-orange-500" />
            <input required type="password" placeholder="كلمة السر" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-orange-500" />
            <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 font-bold text-white transition hover:bg-orange-700 disabled:opacity-60">
              <UserRoundPlus className="h-4 w-4" />
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-3">
            <input required type="text" inputMode="numeric" maxLength={6} placeholder="أدخل رمز التحقق المكوّن من 6 أرقام" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))} className="w-full rounded-xl border border-slate-200 p-3 text-center text-lg font-black tracking-[0.35em] outline-none transition focus:border-orange-500" />
            <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 font-bold text-white transition hover:bg-orange-700 disabled:opacity-60">
              <Send className="h-4 w-4" />
              {loading ? "جاري التحقق..." : "تأكيد الكود"}
            </button>
          </form>
        )}
        {message ? <p className={`mt-3 text-center text-xs ${message.includes("تم") || message.includes("نجاح") ? "text-emerald-600" : "text-slate-600"}`}>{message}</p> : null}
        <div className="mt-4 text-center text-xs text-slate-500">
          لديك حساب بالفعل؟ <Link href="/login" className="font-bold text-orange-600">تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}