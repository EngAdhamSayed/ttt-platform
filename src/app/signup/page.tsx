"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { full_name: fullName } }
    });
    if (error) alert(error.message);
    else alert("تم التسجيل! تحقق من إيميلك.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <h2 className="text-2xl font-bold mb-6">إنشاء حساب جديد</h2>
      <form onSubmit={handleSignup} className="w-full max-w-sm space-y-4">
        <input type="text" placeholder="الاسم الكامل" onChange={(e) => setFullName(e.target.value)} className="w-full p-3 border rounded-xl" />
        <input type="email" placeholder="البريد الإلكتروني" onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-xl" />
        <input type="password" placeholder="كلمة السر" onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-xl" />
        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">إنشاء الحساب</button>
      </form>
    </div>
  );
}