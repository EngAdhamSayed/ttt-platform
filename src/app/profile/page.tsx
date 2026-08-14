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
  Home as HomeIcon,
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
  Plus,
  Video,
  Radio,
  MoreHorizontal,
  ChevronDown,
  Activity,
  ThumbsUp,
  MessageCircle,
  Pin,
} from "lucide-react";

interface Profile {
  id: string;
  user_number_id: string;
  full_name: string;
  avatar_url?: string;
  avatar_type?: "image" | "video";
  cover_url?: string;
  bio?: string;
  location?: string;
  education?: string;
  relationship_status?: string;
  birth_date?: string;
  hobbies?: string[];
  is_verified: boolean;
  role: string;
  rank_tier: string;
  rank_score: number;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  visibility: string;
  created_at: string;
  is_pinned?: boolean;
  media_type?: "image" | "video";
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // أزرار الفلترة النشطة (الكل / الصور / الريلز)
  const [filterType, setFilterType] = useState<"all" | "photos" | "reels">("all");

  // نافذة تعديل البروفايل
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editEducation, setEditEducation] = useState("");
  const [editRelationship, setEditRelationship] = useState("أعزب");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editHobbies, setEditHobbies] = useState("");
  const [isRelDropdownOpen, setIsRelDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // كتابة منشور
  const [postText, setPostText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<"image" | "video">("image");
  const [isPosting, setIsPosting] = useState(false);

  const avatarFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  const relationshipOptions = ["أعزب", "مرتبط", "مخطوب", "متزوج"];

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

    // 1. جلب بيانات البروفايل الحقيقية
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (prof) {
      setProfile(prof);
      setEditFullName(prof.full_name || "مستخدم TTT");
      setEditBio(prof.bio || "");
      setEditLocation(prof.location || "الجيزة، مصر");
      setEditEducation(prof.education || "معهد الجيزة العالي للهندسة والتكنولوجيا");
      setEditRelationship(prof.relationship_status || "أعزب");
      setEditBirthDate(prof.birth_date || "2005-11-08");
      setEditHobbies(prof.hobbies ? prof.hobbies.join(" • ") : "القراءة • الموسيقى • البرمجة");
    }

    // 2. جلب منشورات المستخدم الحقيقية
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

    setLoading(false);
  };

  // 🎥 رفع صورة أو فيديو متحرك 5ث
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = async () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 5.5) {
          alert("عذراً، يجب ألا تزيد مدة الفيديو عن 5 ثوانٍ فقط كصورة شخصية متحركة.");
          return;
        }
        const localUrl = URL.createObjectURL(file);
        setProfile({ ...profile, avatar_url: localUrl, avatar_type: "video" });
        await supabase.from("profiles").update({ avatar_url: localUrl }).eq("id", profile.id);
      };
      video.src = URL.createObjectURL(file);
    } else {
      const localUrl = URL.createObjectURL(file);
      setProfile({ ...profile, avatar_url: localUrl, avatar_type: "image" });
      supabase.from("profiles").update({ avatar_url: localUrl }).eq("id", profile.id);
    }
  };

  // 🌄 رفع صورة الغلاف
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    const localUrl = URL.createObjectURL(file);
    setProfile({ ...profile, cover_url: localUrl });
    await supabase.from("profiles").update({ cover_url: localUrl }).eq("id", profile.id);
  };

  // 📝 نشر منشور جديد وحفظه في Supabase
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || (!postText.trim() && !selectedMedia)) return;

    setIsPosting(true);
    const postPayload = {
      user_id: profile.id,
      content: postText.trim(),
      media_urls: selectedMedia ? [selectedMedia] : [],
      visibility: "public",
    };

    const { data, error } = await supabase.from("posts").insert([postPayload]).select().single();

    if (!error && data) {
      setPosts([data, ...posts]);
      setPostText("");
      setSelectedMedia(null);
    }
    setIsPosting(false);
  };

  // 💾 حفظ التعديلات في قاعدة البيانات
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    const updatePayload = {
      full_name: editFullName.trim(),
      bio: editBio.trim(),
      location: editLocation.trim(),
      education: editEducation.trim(),
      relationship_status: editRelationship,
      birth_date: editBirthDate,
      hobbies: editHobbies.split("•").map((s) => s.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").update(updatePayload).eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, ...updatePayload });
      setIsEditOpen(false);
    }
    setIsSaving(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("هل تريد حذف هذا المنشور؟")) {
      setPosts(posts.filter((p) => p.id !== postId));
      await supabase.from("posts").delete().eq("id", postId);
    }
  };

  // تصفية المنشورات حسب التبويب النشط (الكل / الصور / الريلز)
  const filteredPosts = posts.filter((p) => {
    if (filterType === "photos") return p.media_urls && p.media_urls.length > 0;
    if (filterType === "reels") return p.media_type === "video";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 dir-rtl font-sans select-none pb-24 text-right">
      
      {/* 🟢 1. منطقة الغلاف والصورة والبيانات الأساسية */}
      <div className="bg-white shadow-sm border-b border-slate-100 pb-4">
        
        {/* الغلاف */}
        <div className="h-44 md:h-52 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 relative overflow-hidden">
          {profile?.cover_url ? (
            <img src={profile.cover_url} alt="الغلاف" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30 text-2xl font-black">
              TTT PLATFORM
            </div>
          )}

          {/* زر تغيير الغلاف */}
          <button
            onClick={() => coverFileRef.current?.click()}
            className="absolute bottom-3 left-3 bg-slate-900/60 hover:bg-slate-900/80 text-white p-2 rounded-full backdrop-blur-md transition shadow"
            title="تغيير صورة الغلاف"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

          {/* ملاحظة سريعة */}
          <button className="absolute top-3 right-3 bg-white/90 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-full shadow backdrop-blur-sm">
            ملاحظة...
          </button>
        </div>

        {/* الصورة الشخصية وبجانبها الاسم مباشرة */}
        <div className="max-w-lg mx-auto px-4 -mt-12 relative flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-3xl border-4 border-white shadow-lg overflow-hidden">
              {profile?.avatar_url ? (
                profile.avatar_type === "video" || profile.avatar_url.endsWith(".mp4") ? (
                  <video src={profile.avatar_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={profile.avatar_url} alt="الصورة الشخصية" className="w-full h-full object-cover" />
                )
              ) : (
                profile?.full_name?.charAt(0).toUpperCase() || "A"
              )}
            </div>

            {/* زر كاميرا الصورة الشخصية */}
            <button
              onClick={() => avatarFileRef.current?.click()}
              className="absolute bottom-0 left-0 bg-slate-100 hover:bg-slate-200 border-2 border-white p-1.5 rounded-full shadow text-slate-800 transition"
              title="تغيير الصورة أو فيديو متحرك 5ث"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={avatarFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          {/* الاسم وعلامة التوثيق البرتقالية بجانب الصورة */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{profile?.full_name}</h1>
              {profile?.is_verified && <BadgeCheck className="w-5 h-5 text-orange-500 fill-orange-50" />}
            </div>
            <span className="text-[11px] font-bold text-slate-400 dir-ltr block text-right">
              #{profile?.user_number_id}
            </span>
          </div>
        </div>

        {/* الرتبة والرانك + البايو + الأصدقاء المشتركين تحت الصورة */}
        <div className="max-w-lg mx-auto px-4 mt-2 space-y-2">
          
          {/* الرتبة مع شارة الرانك المميزة */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-xs font-black shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-slate-700">الرتبة:</span>
              <span className="text-orange-600">{profile?.role === "admin" ? "المطور والمؤسس 👑" : "عضو متميز 🌟"}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">
              {friends.length} أصدقاء • {posts.length} منشورات
            </span>
          </div>

          {/* البايو */}
          {profile?.bio && (
            <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              {profile.bio}
            </p>
          )}

          {/* الحالة الاجتماعية */}
          {profile?.relationship_status && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>{profile.relationship_status}</span>
            </div>
          )}

          {/* الأصدقاء المشتركون */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-slate-300 border border-white"></div>
              <div className="w-5 h-5 rounded-full bg-slate-400 border border-white"></div>
              <div className="w-5 h-5 rounded-full bg-slate-500 border border-white"></div>
            </div>
            <span className="text-[11px] font-bold text-slate-600">أصدقاء باهتمامات مشتركة</span>
          </div>

          {/* 🔘 أزرار الإجراءات الرئيسية بهوية المنصة */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => router.push("/")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة إلى القصة</span>
            </button>

            <button
              onClick={() => setIsEditOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-200"
            >
              <Edit3 className="w-4 h-4 text-slate-600" />
              <span>تعديل الملف الشخصي</span>
            </button>
          </div>

        </div>
      </div>

      {/* 🟢 2. أزرار الفلترة بهوية المنصة (الكل / الصور / الريلز) */}
      <div className="max-w-lg mx-auto px-4 mt-3">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "الكل" },
            { id: "photos", label: "الصور" },
            { id: "reels", label: "الريلز" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition ${
                filterType === tab.id
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🟢 3. الأقسام التفصيلية بالكامل معربة */}
      <main className="max-w-lg mx-auto px-4 mt-3 space-y-3">
        
        {/* التفاصيل الشخصية */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-black text-xs text-slate-900">التفاصيل الشخصية</h3>
            <button onClick={() => setIsEditOpen(true)} className="text-slate-400 hover:text-orange-500">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>يقيم في <strong className="text-slate-900">{profile?.location || "الجيزة، مصر"}</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <HomeIcon className="w-4 h-4 text-orange-500" />
              <span>من <strong className="text-slate-900">{profile?.location || "الجيزة، مصر"}</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>تاريخ الميلاد: <strong className="text-slate-900">{profile?.birth_date || "8 نوفمبر 2005"}</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>الحالة الاجتماعية: <strong className="text-slate-900">{profile?.relationship_status || "أعزب"}</strong></span>
            </div>
          </div>
        </div>

        {/* التعليم */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-black text-xs text-slate-900">التعليم</h3>
            <button onClick={() => setIsEditOpen(true)} className="text-slate-400 hover:text-orange-500">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <GraduationCap className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <p className="font-black text-slate-900">{profile?.education || "معهد الجيزة العالي للهندسة والتكنولوجيا"}</p>
              <p className="text-[10px] font-bold text-slate-400">منذ سبتمبر 2025</p>
            </div>
          </div>
        </div>

        {/* الهوايات */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-black text-xs text-slate-900">الاهتمامات والهوايات</h3>
            <button onClick={() => setIsEditOpen(true)} className="text-slate-400 hover:text-orange-500">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Activity className="w-4 h-4 text-orange-500" />
            <span>{editHobbies || "القراءة • الموسيقى • البرمجة"}</span>
          </div>
        </div>

        {/* الأصدقاء */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xs text-slate-900">الأصدقاء</h3>
            <Link href="/friends" className="text-xs font-bold text-orange-600 hover:underline">
              عرض الكل
            </Link>
          </div>

          {friends.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 text-center py-2">لا يوجد أصدقاء مضافين حتى الآن</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 text-center">
              {friends.slice(0, 4).map((f) => (
                <div key={f.id} className="space-y-1">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs border border-orange-500">
                    {f.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-bold text-[10px] text-slate-900 truncate">{f.full_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* كتابة منشور */}
        <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs">
              {profile?.full_name?.charAt(0).toUpperCase() || "A"}
            </div>
            <input
              type="text"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="بم تفكر الآن؟"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-orange-500"
            />
            <label className="cursor-pointer text-slate-500 hover:text-orange-500 p-1">
              <ImageIcon className="w-5 h-5 text-emerald-500" />
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setSelectedMedia(URL.createObjectURL(f));
                    setSelectedMediaType(f.type.startsWith("video") ? "video" : "image");
                  }
                }}
              />
            </label>
          </div>

          {selectedMedia && (
            <div className="relative rounded-2xl overflow-hidden max-h-40 border border-slate-200">
              {selectedMediaType === "image" ? (
                <img src={selectedMedia} alt="Media" className="w-full object-cover max-h-40" />
              ) : (
                <video src={selectedMedia} controls className="w-full max-h-40" />
              )}
              <button onClick={() => setSelectedMedia(null)} className="absolute top-2 left-2 bg-black/70 text-white p-1 rounded-full">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button className="flex items-center justify-center gap-1 text-xs font-bold text-slate-700 py-1 hover:bg-slate-50 rounded-xl">
              <Video className="w-4 h-4 text-orange-500" />
              <span>ريلز (Reel)</span>
            </button>
            <button className="flex items-center justify-center gap-1 text-xs font-bold text-slate-700 py-1 hover:bg-slate-50 rounded-xl">
              <Radio className="w-4 h-4 text-red-500" />
              <span>بث مباشر</span>
            </button>
          </div>

          {(postText.trim() || selectedMedia) && (
            <button
              onClick={handleCreatePost}
              disabled={isPosting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm shadow-orange-500/20"
            >
              {isPosting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "نشر الآن"}
            </button>
          )}
        </div>

        {/* عرض المنشورات المفلترة */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xs text-slate-900">المنشورات ({filteredPosts.length})</h3>
            <span className="text-[11px] font-bold text-orange-600 cursor-pointer">إدارة المنشورات</span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center shadow-sm">
              <p className="text-xs font-bold text-slate-400">لا توجد منشورات في هذا التبويب</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs border border-orange-500">
                      {profile?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="font-black text-xs text-slate-900">{profile?.full_name}</h4>
                        {profile?.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-orange-500" />}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(post.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })} • 🌐
                      </span>
                    </div>
                  </div>

                  <button onClick={() => handleDeletePost(post.id)} className="text-slate-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs font-medium text-slate-800 leading-relaxed">{post.content}</p>

                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="rounded-2xl overflow-hidden border border-slate-100">
                    <img src={post.media_urls[0]} alt="Media" className="w-full object-cover max-h-80" />
                  </div>
                )}

                <div className="flex items-center justify-around pt-2 text-slate-600 text-xs font-bold border-t border-slate-100">
                  <button className="flex items-center gap-1 hover:text-orange-600"><ThumbsUp className="w-3.5 h-3.5" /> إعجاب</button>
                  <button className="flex items-center gap-1 hover:text-orange-600"><MessageCircle className="w-3.5 h-3.5" /> تعليق</button>
                  <button className="flex items-center gap-1 hover:text-orange-600"><Share2 className="w-3.5 h-3.5" /> مشاركة</button>
                </div>
              </div>
            ))
          )}
        </div>

      </main>

      {/* 🟢 4. نافذة تعديل البروفايل مع Dropdown مخصص بالهوية */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-3.5 shadow-2xl text-right max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900">تعديل الملف الشخصي</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-2.5 text-xs font-bold">
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
                <label className="text-slate-600 block mb-1">النبذة (Bio)</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">المدينة / الإقامة</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">التعليم</label>
                <input
                  type="text"
                  value={editEducation}
                  onChange={(e) => setEditEducation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* القائمة المنسدلة المخصصة بهوية المنصة */}
              <div className="relative">
                <label className="text-slate-600 block mb-1">الحالة الاجتماعية</label>
                <button
                  type="button"
                  onClick={() => setIsRelDropdownOpen(!isRelDropdownOpen)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold text-slate-800 flex items-center justify-between hover:border-orange-500 transition"
                >
                  <span>{editRelationship}</span>
                  <ChevronDown className="w-4 h-4 text-orange-500" />
                </button>

                {isRelDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-orange-100 rounded-2xl shadow-xl z-50 p-1 space-y-1">
                    {relationshipOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setEditRelationship(opt);
                          setIsRelDropdownOpen(false);
                        }}
                        className={`w-full text-right p-2 rounded-xl text-xs font-bold transition ${
                          editRelationship === opt ? "bg-orange-500 text-white" : "hover:bg-orange-50 text-slate-700"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-600 block mb-1">الاهتمامات والهوايات</label>
                <input
                  type="text"
                  value={editHobbies}
                  onChange={(e) => setEditHobbies(e.target.value)}
                  placeholder="مثال: القراءة • البرمجة • الموسيقى"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md shadow-orange-500/20 mt-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "حفظ التعديلات"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}