"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <h1 className="text-4xl font-black text-blue-600 mb-8">TTT Platform</h1>
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <input type="email" placeholder="البريد الإلكتروني" onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-xl" />
        <input type="password" placeholder="كلمة السر" onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-xl" />
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">تسجيل الدخول</button>
      </form>
    </div>
  );
}