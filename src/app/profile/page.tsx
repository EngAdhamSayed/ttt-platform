"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, MapPin, Calendar, GraduationCap, Heart, Edit, CheckCircle2, ShieldCheck } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  birth_date: string | null;
  education: string | null;
  relationship_status: string | null;
  is_verified?: boolean;
  role?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data as UserProfile);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-24 dir-rtl font-sans">
      {/* Cover Header */}
      <div className="h-44 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 relative">
        <div className="absolute -bottom-12 right-4 w-24 h-24 rounded-full border-4 border-white bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-xl overflow-hidden shadow-md">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            profile?.full_name?.charAt(0).toUpperCase() || "U"
          )}
        </div>
      </div>

      <main className="max-w-md mx-auto p-4 pt-14 space-y-4">
        {/* Profile Info Header */}
        <div className="text-right space-y-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-black text-slate-900">{profile?.full_name || "مستخدم"}</h1>
            {profile?.is_verified && (
              <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-500 text-white" />
            )}
          </div>

          {profile?.role === "admin" && (
            <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مؤسس ومطور المنصة (Founder & Owner)</span>
            </div>
          )}

          {profile?.bio && <p className="text-xs text-slate-600 pt-1">{profile.bio}</p>}
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs flex justify-center items-center gap-1 transition">
            <Edit className="w-3.5 h-3.5" />
            <span>تعديل الملف الشخصي</span>
          </button>
        </div>

        {/* Dynamic Personal Details Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-right">
          <h2 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">التفاصيل الشخصية</h2>
          
          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>يقيم في: {profile?.location || "غير محدد"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>تاريخ الميلاد: {profile?.birth_date || "غير محدد"}</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span>التعليم: {profile?.education || "غير محدد"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-slate-400" />
              <span>الحالة الاجتماعية: {profile?.relationship_status || "غير محدد"}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}