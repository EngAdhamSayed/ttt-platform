"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowRight, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      alert("حدث خطأ: " + error.message);
    } else {
      setMessage("تم إرسال رابط إعادة ضبط كلمة السر إلى بريدك الإلكتروني بنجاح!");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4 dir-rtl font-sans">
      <div className="w-full max-w-sm space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 text-right shadow-sm">
        <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 transition hover:text-slate-800">
          <ArrowRight className="h-4 w-4" />
          <span>الرجوع للتسجيل</span>
        </Link>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-slate-900">استعادة كلمة السر</h1>
          <p className="text-xs text-slate-500">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة السر.</p>
        </div>

        {message && <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-700">{message}</div>}

        <form onSubmit={handleReset} className="space-y-3">
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pr-10 text-xs outline-none transition focus:border-blue-600"
            />
            <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>إرسال الرابط</span>}
          </button>
        </form>
      </div>
    </div>
  );
}