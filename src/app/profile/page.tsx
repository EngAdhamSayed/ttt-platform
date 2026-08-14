"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BadgeCheck,
  Camera,
  Edit3,
  MapPin,
  Calendar,
  Heart,
  Share2,
  Lock,
  Globe,
  Loader2,
  Trash2,
  X,
  Check,
  Sparkles,
} from "lucide-react";

interface Profile {
  id: string;
  user_number_id: string;
  full_name: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  relationship_status?: string;
  birth_date?: string;
  is_verified: boolean;
  rank_tier: string;
  rank_score: number;
}

interface Post {
  id: string;
  content: string;
  media_urls?: string[];
  visibility: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "media">("posts");
  const [loading, setLoading] = useState(true);

  // نافذة تعديل البروفايل
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editRelationship, setEditRelationship] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push("/login");
      return;
    }

    const uid = session.user.id;

    // جلب بيانات البروفايل
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (prof) {
      setProfile(prof);
      setEditFullName(prof.full_name || "");
      setEditBio(prof.bio || "");
      setEditLocation(prof.location || "");
      setEditRelationship(prof.relationship_status || "");
    }

    // جلب منشورات المستخدم الخاصة
    const { data: myPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (myPosts) setPosts(myPosts);

    // عدد الأصدقاء
    const { count } = await supabase
      .from("friendships")
      .select("*", { count: "exact", head: true })
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .eq("status", "accepted");

    setFriendsCount(count || 0);
    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editFullName.trim(),
        bio: editBio.trim(),
        location: editLocation.trim(),
        relationship_status: editRelationship,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (!error) {
      setProfile({
        ...profile,
        full_name: editFullName.trim(),
        bio: editBio.trim(),
        location: editLocation.trim(),
        relationship_status: editRelationship,
      });
      setIsEditOpen(false);
    }
    setIsSaving(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("هل تريد حذف هذا المنشور نهائياً؟")) {
      setPosts(posts.filter((p) => p.id !== postId));
      await supabase.from("posts").delete().eq("id", postId);
    }
  };

  const getRankBadge = (tier: string) => {
    switch (tier) {
      case "millionaire_dev":
        return { label: "المطور والمؤسس 👑", color: "from-amber-400 to-yellow-600 text-white" };
      case "diamond":
        return { label: "الماسي 💎", color: "from-cyan-400 to-blue-600 text-white" };
      case "ruby":
        return { label: "ياقوتي 🩸", color: "from-rose-500 to-red-700 text-white" };
      case "platinum":
        return { label: "بلاتيني 🛡️", color: "from-slate-300 to-slate-500 text-white" };
      case "gold":
        return { label: "ذهبي 🌟", color: "from-yellow-400 to-amber-500 text-slate-900" };
      case "silver":
        return { label: "فضي 🥈", color: "from-slate-200 to-slate-400 text-slate-900" };
      default:
        return { label: "برونزي 🥉", color: "from-amber-600 to-amber-800 text-white" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const rank = getRankBadge(profile?.rank_tier || "bronze");

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 dir-rtl font-sans select-none pb-24">
      
      {/* 1️⃣ الغلاف والصورة الشخصية */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-44 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 relative overflow-hidden shadow-inner">
          {profile?.cover_url && (
            <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Avatar & Main Info */}
        <div className="max-w-lg mx-auto px-4 -mt-16 relative flex items-end justify-between">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-3xl border-4 border-white shadow-xl">
              {profile?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <button className="absolute bottom-1 left-1 bg-white p-1.5 rounded-full shadow-md text-slate-700 hover:text-orange-600 transition">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsEditOpen(true)}
            className="bg-white border border-slate-200 text-slate-800 font-bold px-4 py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm hover:bg-orange-50 hover:border-orange-200 transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-orange-500" />
            <span>تعديل الملف الشخصي</span>
          </button>
        </div>

        {/* تفاصيل الاسم والرتبة */}
        <div className="max-w-lg mx-auto px-4 mt-3 space-y-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-black text-slate-900">{profile?.full_name}</h2>
              {profile?.is_verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
            </div>
            <span className="text-xs font-bold text-slate-400 dir-ltr block text-right">
              #{profile?.user_number_id}
            </span>
          </div>

          {/* الرتبة */}
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r text-xs font-black shadow-sm shadow-orange-500/10">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-slate-700">الرتبة: </span>
            <span className={`px-2 py-0.5 rounded-lg bg-gradient-to-r ${rank.color} text-[10px]`}>
              {rank.label}
            </span>
          </div>

          {profile?.bio && <p className="text-xs font-medium text-slate-700 leading-relaxed">{profile.bio}</p>}

          {/* إحصائيات سريعة */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600 pt-1">
            <span>
              <strong className="text-slate-900">{posts.length}</strong> منشورات
            </span>
            <span>•</span>
            <span>
              <strong className="text-slate-900">{friendsCount}</strong> أصدقاء
            </span>
          </div>
        </div>
      </div>

      {/* 2️⃣ التبويبات */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-1 flex shadow-sm">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
              activeTab === "posts" ? "bg-orange-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            المنشورات
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
              activeTab === "about" ? "bg-orange-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            حول
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
              activeTab === "media" ? "bg-orange-500 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            الصور والوسائط
          </button>
        </div>
      </div>

      {/* 3️⃣ محتوى التبويبات */}
      <main className="max-w-lg mx-auto px-4 mt-4 space-y-3">
        {/* تبويب المنشورات */}
        {activeTab === "posts" && (
          <>
            {posts.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center shadow-sm">
                <p className="text-xs font-bold text-slate-400">لم تقم بنشر أي شيء بعد</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs border-2 border-orange-500">
                        {profile?.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="font-black text-xs text-slate-900">{profile?.full_name}</h4>
                          {profile?.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(post.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 transition"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{post.content}</p>

                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100">
                      <img src={post.media_urls[0]} alt="Media" className="w-full object-cover max-h-72" />
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* تبويب حول */}
        {activeTab === "about" && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>الموقع: {profile?.location || "غير محدد"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>الحالة الاجتماعية: {profile?.relationship_status || "غير محدد"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>تاريخ الانضمام: {new Date(profile?.id ? Date.now() : 0).getFullYear()}</span>
            </div>
          </div>
        )}

        {/* تبويب الوسائط */}
        {activeTab === "media" && (
          <div className="grid grid-cols-3 gap-2">
            {posts
              .filter((p) => p.media_urls && p.media_urls.length > 0)
              .map((p) => (
                <div key={p.id} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                  <img src={p.media_urls![0]} alt="Media" className="w-full h-full object-cover" />
                </div>
              ))}
          </div>
        )}
      </main>

      {/* 4️⃣ نافذة تعديل البروفايل */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900">تعديل الملف الشخصي</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-slate-600 block mb-1">الاسم بالكامل</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">النبذة التعريفية (Bio)</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="اكتب شيئاً عن نفسك..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">الموقع / المدينة</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="مثال: القاهرة، مصر"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">الحالة الاجتماعية</label>
                <select
                  value={editRelationship}
                  onChange={(e) => setEditRelationship(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                >
                  <option value="">غير محدد</option>
                  <option value="أعزب">أعزب</option>
                  <option value="مرتبط">مرتبط</option>
                  <option value="متزوج">متزوج</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-1 mt-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>حفظ التعديلات</span>}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}