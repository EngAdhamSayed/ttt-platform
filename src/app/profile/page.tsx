"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, MapPin, Calendar, GraduationCap, Heart, Edit, Camera, ShieldCheck, CheckCircle2 } from "lucide-react";

interface UserProfile {
  id: string;
  user_number_id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location: string | null;
  birth_date: string | null;
  education: string | null;
  relationship_status: string | null;
  is_verified?: boolean;
  role?: string;
  rank_tier?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ postsCount: 0, friendsCount: 0 });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile(data as UserProfile);

      // Fetch Real Counts
      const { count: postsCount } = await supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      const { count: friendsCount } = await supabase.from("friendships").select("*", { count: "exact", head: true }).or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).eq("status", "accepted");

      setStats({ postsCount: postsCount || 0, friendsCount: friendsCount || 0 });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 dir-rtl font-sans">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-orange-500 to-amber-500 relative">
        {profile?.cover_url && <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />}
        <button className="absolute bottom-3 left-3 p-2 bg-black/40 backdrop-blur-md text-white rounded-full"><Camera className="w-4 h-4" /></button>
        
        {/* Avatar */}
        <div className="absolute -bottom-12 right-4 w-24 h-24 rounded-full border-4 border-white bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xl overflow-hidden shadow-md">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : profile?.full_name?.charAt(0)}
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 pt-14 space-y-4 text-right">
        {/* Name & Rank */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">{profile?.full_name}</h1>
            {profile?.is_verified && <CheckCircle2 className="w-5 h-5 text-orange-500 fill-orange-500 text-white" />}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded-md">ID: #{profile?.user_number_id}</span>
            {profile?.role === "admin" && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>مؤسس ومطور المنصة</span>
              </span>
            )}
          </div>

          {profile?.bio && <p className="text-xs text-slate-600 pt-2">{profile.bio}</p>}
        </div>

        {/* Real Stats */}
        <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-2xl border border-slate-200 text-center">
          <div>
            <span className="block text-sm font-black text-slate-900">{stats.postsCount}</span>
            <span className="text-[10px] text-slate-400 font-bold">المنشورات</span>
          </div>
          <div>
            <span className="block text-sm font-black text-slate-900">{stats.friendsCount}</span>
            <span className="text-[10px] text-slate-400 font-bold">الأصدقاء</span>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">التفاصيل الشخصية</h2>
          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /><span>يقيم في: {profile?.location || "غير محدد"}</span></div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /><span>تاريخ الميلاد: {profile?.birth_date || "غير محدد"}</span></div>
            <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-slate-400" /><span>التعليم: {profile?.education || "غير محدد"}</span></div>
            <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-slate-400" /><span>الحالة الاجتماعية: {profile?.relationship_status || "غير محدد"}</span></div>
          </div>
        </div>
      </main>
    </div>
  );
}