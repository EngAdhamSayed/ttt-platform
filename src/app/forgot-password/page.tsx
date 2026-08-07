"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowRight, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 dir-rtl font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full max-w-sm space-y-4 text-right">
        <Link href="/login" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-bold">
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع للتسجيل</span>
        </Link>

        <h1 className="text-xl font-black text-slate-900">استعادة كلمة السر</h1>
        <p className="text-xs text-slate-500">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة السر.</p>

        {message && <div className="p-3 bg-green-50 text-green-700 text-xs rounded-xl border border-green-200">{message}</div>}

        <form onSubmit={handleReset} className="space-y-3">
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs pr-10 focus:outline-none focus:border-blue-600"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>إرسال الرابط</span>}
          </button>
        </form>
      </div>
    </div>
  );
}