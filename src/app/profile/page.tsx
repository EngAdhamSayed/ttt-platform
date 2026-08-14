"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Camera,
  Edit3,
  MapPin,
  Calendar,
  Heart,
  GraduationCap,
  Sparkles,
  Share2,
  Trash2,
  Lock,
  Globe,
  Loader2,
  X,
  Check,
  Image as ImageIcon,
  Send,
  Users,
  ShieldCheck,
  Award,
  ArrowRight,
} from "lucide-react";

interface Profile {
  id: string;
  user_number_id: string;
  username?: string;
  full_name: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  education?: string;
  relationship_status?: string;
  birth_date?: string;
  is_verified: boolean;
  role: string;
  rank_tier: string;
  rank_score: number;
  created_at: string;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  visibility: string;
  created_at: string;
}

interface FriendProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  user_number_id: string;
  is_verified: boolean;
}

export default function ProfilePage() {
  const router = useRouter();

  // البيانات الأساسية
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // التبويب النشط
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "media" | "friends">("posts");

  // نشر منشور جديد من البروفايل
  const [newPostText, setNewPostText] = useState("");
  const [newPostMedia, setNewPostMedia] = useState<string | null>(null);
  const [newPostVisibility, setNewPostVisibility] = useState<"public" | "friends">("public");
  const [isPosting, setIsPosting] = useState(false);

  // نافذة تعديل الملف الشخصي
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editEducation, setEditEducation] = useState("");
  const [editRelationship, setEditRelationship] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // معاينة الصور الكبيرة
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  // رفع وتغيير الصور
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCompleteProfile();
  }, []);

  const fetchCompleteProfile = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push("/login");
      return;
    }

    const uid = session.user.id;

    // 1. جلب بيانات البروفايل
    const { data: profData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();

    if (profData) {
      setProfile(profData);
      setEditFullName(profData.full_name || "");
      setEditBio(profData.bio || "");
      setEditLocation(profData.location || "");
      setEditEducation(profData.education || "");
      setEditRelationship(profData.relationship_status || "");
      setEditBirthDate(profData.birth_date || "");
    }

    // 2. جلب منشورات المستخدم
    const { data: myPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (myPosts) setPosts(myPosts);

    // 3. جلب الأصدقاء المقبولين
    const { data: relations } = await supabase
      .from("friendships")
      .select("sender_id, receiver_id, status")
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .eq("status", "accepted");

    const friendIds = (relations || []).map((r) =>
      r.sender_id === uid ? r.receiver_id : r.sender_id
    );

    if (friendIds.length > 0) {
      const { data: friendsData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, user_number_id, is_verified")
        .in("id", friendIds);

      if (friendsData) setFriends(friendsData);
    } else {
      setFriends([]);
    }

    // 4. جلب عدد المتابعين
    const { count: followers } = await supabase
      .from("friendships")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", uid)
      .eq("status", "following");

    setFollowersCount(followers || 0);
    setLoading(false);
  };

  // 📝 نشر منشور جديد داخل البروفايل
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || (!newPostText.trim() && !newPostMedia)) return;

    setIsPosting(true);
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: profile.id,
        content: newPostText.trim(),
        media_urls: newPostMedia ? [newPostMedia] : [],
        visibility: newPostVisibility,
      })
      .select()
      .single();

    if (!error && data) {
      setPosts([data, ...posts]);
      setNewPostText("");
      setNewPostMedia(null);
    }
    setIsPosting(false);
  };

  // 🗑️ حذف منشور
  const handleDeletePost = async (postId: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا المنشور؟")) {
      setPosts(posts.filter((p) => p.id !== postId));
      await supabase.from("posts").delete().eq("id", postId);
    }
  };

  // 💾 حفظ تعديلات الملف الشخصي
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSavingProfile(true);
    const updatedFields = {
      full_name: editFullName.trim(),
      bio: editBio.trim(),
      location: editLocation.trim(),
      education: editEducation.trim(),
      relationship_status: editRelationship,
      birth_date: editBirthDate || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updatedFields)
      .eq("id", profile.id);

    if (!error) {
      setProfile({
        ...profile,
        ...updatedFields,
      });
      setIsEditOpen(false);
    }
    setIsSavingProfile(false);
  };

  // 📸 تغيير الصورة الشخصية أو الغلاف
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover") => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    const fakeLocalUrl = URL.createObjectURL(file);

    if (type === "avatar") {
      setProfile({ ...profile, avatar_url: fakeLocalUrl });
      await supabase.from("profiles").update({ avatar_url: fakeLocalUrl }).eq("id", profile.id);
    } else {
      setProfile({ ...profile, cover_url: fakeLocalUrl });
      await supabase.from("profiles").update({ cover_url: fakeLocalUrl }).eq("id", profile.id);
    }
  };

  // 🎖️ تصميم وتنسيق شارة الرتبة
  const getRankConfig = (tier: string) => {
    switch (tier) {
      case "millionaire_dev":
        return { label: "المطور والمؤسس 👑", gradient: "from-amber-500 via-yellow-400 to-orange-500 text-white shadow-amber-500/30" };
      case "diamond":
        return { label: "الماسي 💎", gradient: "from-cyan-500 to-blue-600 text-white shadow-blue-500/30" };
      case "ruby":
        return { label: "ياقوتي 🩸", gradient: "from-rose-500 to-red-700 text-white shadow-red-500/30" };
      case "platinum":
        return { label: "بلاتيني 🛡️", gradient: "from-slate-400 to-zinc-600 text-white shadow-zinc-500/30" };
      case "gold":
        return { label: "ذهبي 🌟", gradient: "from-yellow-400 to-amber-500 text-slate-900 shadow-yellow-500/30" };
      case "silver":
        return { label: "فضي 🥈", gradient: "from-slate-200 to-slate-400 text-slate-800 shadow-slate-400/30" };
      default:
        return { label: "برونزي 🥉", gradient: "from-amber-700 to-orange-800 text-white shadow-amber-800/30" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="text-xs font-bold text-slate-500">جاري تحميل الملف الشخصي...</span>
      </div>
    );
  }

  const rank = getRankConfig(profile?.rank_tier || "bronze");

  // تجميع كل وسائط المنشورات لتبويب الصور
  const mediaList = posts.flatMap((p) => p.media_urls || []);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 dir-rtl font-sans select-none pb-24">
      
      {/* 🟢 1. منطقة الغلاف والصورة الشخصية */}
      <div className="relative bg-white shadow-sm pb-4 border-b border-slate-100">
        
        {/* Cover Photo */}
        <div className="h-44 md:h-52 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 relative overflow-hidden group">
          {profile?.cover_url && (
            <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
          )}
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-3 left-3 bg-slate-900/60 hover:bg-slate-900/80 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm transition flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>تغيير الغلاف</span>
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhotoUpload(e, "cover")}
          />
        </div>

        {/* Avatar & Edit Actions */}
        <div className="max-w-lg mx-auto px-4 -mt-16 flex items-end justify-between relative">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-4xl border-4 border-white shadow-xl overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.full_name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-1 left-1 bg-white p-2 rounded-full shadow-lg text-slate-700 hover:text-orange-600 border border-slate-100 transition"
              title="تغيير الصورة الشخصية"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoUpload(e, "avatar")}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditOpen(true)}
              className="bg-slate-50 hover:bg-orange-50/70 border border-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-orange-500" />
              <span>تعديل الملف</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("تم نسخ رابط الملف الشخصي بنجاح!");
              }}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 p-2 rounded-2xl transition"
              title="مشاركة الملف"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* الاسم والتفاصيل والرتبة */}
        <div className="max-w-lg mx-auto px-4 mt-3 space-y-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black text-slate-900 tracking-wide">{profile?.full_name}</h1>
              {profile?.is_verified && (
                <span title="حساب موثق">
                  <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50" />
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-slate-400 dir-ltr block text-right mt-0.5">
              #{profile?.user_number_id}
            </span>
          </div>

          {/* رتبة المستخدم مع الأنيميشن اللوني */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-bold text-slate-700">الرتبة:</span>
            <span className={`px-2 py-0.5 rounded-lg bg-gradient-to-r text-[10px] font-black shadow-sm ${rank.gradient}`}>
              {rank.label}
            </span>
          </div>

          {/* النبذة التعريفية */}
          {profile?.bio && (
            <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50/60 p-2.5 rounded-2xl border border-slate-100">
              {profile.bio}
            </p>
          )}

          {/* إحصائيات البروفايل الفعلية */}
          <div className="flex items-center justify-around bg-slate-50/90 rounded-2xl p-2.5 border border-slate-100 text-center">
            <div>
              <span className="block font-black text-sm text-slate-900">{posts.length}</span>
              <span className="text-[10px] font-bold text-slate-400">المنشورات</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="block font-black text-sm text-slate-900">{friends.length}</span>
              <span className="text-[10px] font-bold text-slate-400">الأصدقاء</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="block font-black text-sm text-slate-900">{followersCount}</span>
              <span className="text-[10px] font-bold text-slate-400">المتابعون</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 2. التبويبات الأربعة */}
      <div className="max-w-lg mx-auto px-4 mt-3">
        <div className="bg-white border border-slate-100 rounded-2xl p-1 flex items-center justify-between shadow-sm">
          {[
            { id: "posts", label: "المنشورات" },
            { id: "about", label: "حول" },
            { id: "media", label: `الصور (${mediaList.length})` },
            { id: "friends", label: `الأصدقاء (${friends.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
                activeTab === tab.id
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🟢 3. محتوى التبويبات */}
      <main className="max-w-lg mx-auto px-4 mt-3 space-y-3">
        
        {/* 📑 تبويب 1: المنشورات */}
        {activeTab === "posts" && (
          <div className="space-y-3">
            {/* صندوق نشر جديد داخل البروفايل */}
            <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-slate-800">إنشاء منشور في صفحتك</span>
                <select
                  value={newPostVisibility}
                  onChange={(e) => setNewPostVisibility(e.target.value as "public" | "friends")}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-[10px] font-bold text-slate-700 focus:outline-none focus:border-orange-500"
                >
                  <option value="public">🌐 عام</option>
                  <option value="friends">👥 الأصدقاء فقط</option>
                </select>
              </div>

              <textarea
                rows={2}
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="اكتب شيئاً على ملفك الشخصي..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-xs font-medium focus:outline-none focus:border-orange-500 resize-none placeholder:text-slate-400"
              />

              {newPostMedia && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-40">
                  <img src={newPostMedia} alt="Media" className="w-full object-cover max-h-40" />
                  <button
                    onClick={() => setNewPostMedia(null)}
                    className="absolute top-2 left-2 bg-slate-900/70 text-white p-1 rounded-full hover:bg-slate-900"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleCreatePost}
                  disabled={(!newPostText.trim() && !newPostMedia) || isPosting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-orange-500/20 transition"
                >
                  {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 rotate-180" />}
                  <span>نشر</span>
                </button>

                <label className="cursor-pointer flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-xl transition">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>إرفاق صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setNewPostMedia(URL.createObjectURL(file));
                    }}
                  />
                </label>
              </div>
            </div>

            {/* قائمة منشورات المستخدم */}
            {posts.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center shadow-sm">
                <p className="text-xs font-bold text-slate-400">لا توجد منشورات على ملفك الشخصي حتى الآن</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs border-2 border-orange-500">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          profile?.full_name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="font-black text-xs text-slate-900">{profile?.full_name}</h4>
                          {profile?.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                          <span>{new Date(post.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
                          <span>•</span>
                          <span>{post.visibility === "public" ? <Globe className="w-3 h-3 inline" /> : <Lock className="w-3 h-3 inline" />}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 transition"
                      title="حذف المنشور"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{post.content}</p>

                  {post.media_urls && post.media_urls.length > 0 && (
                    <div
                      onClick={() => setPreviewMediaUrl(post.media_urls![0])}
                      className="rounded-2xl overflow-hidden border border-slate-100 cursor-pointer max-h-72"
                    >
                      <img src={post.media_urls[0]} alt="Media" className="w-full object-cover max-h-72 hover:scale-102 transition duration-200" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 📑 تبويب 2: حول (About) */}
        {activeTab === "about" && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3.5 text-xs font-bold text-slate-700">
            <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2">المعلومات الشخصية</h3>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>الإقامة: {profile?.location || "غير محددة"}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <span>التعليم: {profile?.education || "غير محدد"}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>الحالة الاجتماعية: {profile?.relationship_status || "غير محددة"}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>تاريخ الميلاد: {profile?.birth_date || "غير محدد"}</span>
            </div>

            <hr className="border-slate-100 my-2" />

            <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2">بيانات الرتبة والتوثيق</h3>

            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>حالة التوثيق: {profile?.is_verified ? "حساب موثق بالعلامة الزرقاء ✅" : "غير موثق"}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-orange-500" />
              <span>نقاط النشاط (Score): {profile?.rank_score?.toLocaleString() || 0} نقطة</span>
            </div>
          </div>
        )}

        {/* 📑 تبويب 3: الصور والوسائط (Media Gallery) */}
        {activeTab === "media" && (
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            {mediaList.length === 0 ? (
              <p className="text-center text-xs font-bold text-slate-400 py-6">لا توجد صور مرفوعة في المنشورات بعد</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {mediaList.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPreviewMediaUrl(url)}
                    className="aspect-square rounded-2xl overflow-hidden border border-slate-100 cursor-pointer shadow-sm group"
                  >
                    <img src={url} alt={`Media ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 📑 تبويب 4: الأصدقاء (Friends) */}
        {activeTab === "friends" && (
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2.5">
            {friends.length === 0 ? (
              <p className="text-center text-xs font-bold text-slate-400 py-6">لا يوجد أصدقاء مضافين حتى الآن</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {friends.map((fr) => (
                  <div
                    key={fr.id}
                    className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center gap-2.5"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs border border-orange-500">
                      {fr.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1">
                        <span className="font-black text-xs text-slate-900 truncate">{fr.full_name}</span>
                        {fr.is_verified && <BadgeCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 dir-ltr block">#{fr.user_number_id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* 🟢 4. نافذة تعديل البروفايل (Edit Profile Modal) */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-3.5 shadow-2xl text-right max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900">تعديل الملف الشخصي</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-slate-600 block mb-1">الاسم الكامل</label>
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
                <label className="text-slate-600 block mb-1">المدينة / الإقامة</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="مثال: الجيزة، مصر"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">التعليم / الدراسة</label>
                <input
                  type="text"
                  value={editEducation}
                  onChange={(e) => setEditEducation(e.target.value)}
                  placeholder="مثال: هندسة حاسبات"
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
                  <option value="مخطوب">مخطوب</option>
                  <option value="متزوج">متزوج</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">تاريخ الميلاد</label>
                <input
                  type="date"
                  value={editBirthDate}
                  onChange={(e) => setEditBirthDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500 text-right"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-1 mt-2"
              >
                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>حفظ التعديلات</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 5. نافذة تكبير وعرض الصورة (Image Lightbox) */}
      {previewMediaUrl && (
        <div
          onClick={() => setPreviewMediaUrl(null)}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-lg w-full max-h-[85vh] rounded-3xl overflow-hidden border border-slate-800">
            <img src={previewMediaUrl} alt="Preview" className="w-full h-full object-contain" />
            <button
              onClick={() => setPreviewMediaUrl(null)}
              className="absolute top-3 left-3 bg-white/20 p-2 rounded-full text-white hover:bg-white/40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}