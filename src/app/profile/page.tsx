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
  Search,
  MessageSquare,
  Activity,
  Smile,
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

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // الفلترة السريعة (All, Photos, Reels)
  const [filterType, setFilterType] = useState<"all" | "photos" | "reels">("all");

  // نافذة تعديل البروفايل
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editEducation, setEditEducation] = useState("");
  const [editRelationship, setEditRelationship] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editHobbies, setEditHobbies] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // صندوق نشر المنشور
  const [postText, setPostText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // رفع الوسائط
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  // هايلايتس تجريبية للهوية
  const highlights = [
    { id: "1", title: "معاميمي 🤎✨", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" },
    { id: "2", title: "Mo2tatafat", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400" },
    { id: "3", title: "engineering..", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
  ];

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

    // 1. جلب بيانات البروفايل
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (prof) {
      setProfile(prof);
      setEditFullName(prof.full_name || "");
      setEditBio(prof.bio || "");
      setEditLocation(prof.location || "");
      setEditEducation(prof.education || "");
      setEditRelationship(prof.relationship_status || "");
      setEditBirthDate(prof.birth_date || "");
      setEditHobbies(prof.hobbies ? prof.hobbies.join(" • ") : "القراءة • الموسيقى • البرمجة");
    }

    // 2. جلب منشورات المستخدم
    const { data: myPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (myPosts) setPosts(myPosts);

    // 3. جلب قائمة الأصدقاء
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
    }

    setLoading(false);
  };

  // 🎥 رفع صورة شخصية عادية أو فيديو متحرك لا يزيد عن 5 ثواني
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = async () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 5.5) {
          alert("عذراً، يجب ألا يزيد الفيديو عن 5 ثوانٍ فقط كصورة شخصية متحركة.");
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

  // 📝 نشر منشور جديد
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || (!postText.trim() && !selectedMedia)) return;

    setIsPosting(true);
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: profile.id,
        content: postText.trim(),
        media_urls: selectedMedia ? [selectedMedia] : [],
        visibility: "public",
      })
      .select()
      .single();

    if (!error && data) {
      setPosts([data, ...posts]);
      setPostText("");
      setSelectedMedia(null);
    }
    setIsPosting(false);
  };

  // 💾 حفظ تعديلات البيانات الشخصية
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    const hobbiesArray = editHobbies.split("•").map((s) => s.trim()).filter(Boolean);

    const updatePayload = {
      full_name: editFullName.trim(),
      bio: editBio.trim(),
      location: editLocation.trim(),
      education: editEducation.trim(),
      relationship_status: editRelationship,
      birth_date: editBirthDate || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").update(updatePayload).eq("id", profile.id);

    if (!error) {
      setProfile({
        ...profile,
        ...updatePayload,
        hobbies: hobbiesArray,
      });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 dir-rtl font-sans select-none pb-24">
      
      {/* 🟢 1. الهيدر العلوي بأسلوب Facebook */}
      <div className="relative bg-white shadow-sm pb-4 border-b border-slate-100">
        
        {/* الغلاف (Cover Photo) */}
        <div className="h-48 md:h-56 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 relative group overflow-hidden">
          {profile?.cover_url ? (
            <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-400 via-amber-500 to-orange-600"></div>
          )}

          {/* زر تغيير الغلاف */}
          <button
            onClick={() => coverFileRef.current?.click()}
            className="absolute bottom-3 left-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition shadow-md"
            title="تعديل صورة الغلاف"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

          {/* زر Share a note */}
          <button className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm transition flex items-center gap-1">
            <span>ملاحظة...</span>
          </button>
        </div>

        {/* الصورة الشخصية (تدعم فيديو 5 ثواني أو صورة) */}
        <div className="max-w-lg mx-auto px-4 -mt-16 relative flex items-end justify-between">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-4xl border-4 border-white shadow-xl overflow-hidden relative">
              {profile?.avatar_url ? (
                profile.avatar_type === "video" || profile.avatar_url.endsWith(".mp4") ? (
                  <video src={profile.avatar_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                )
              ) : (
                profile?.full_name?.charAt(0).toUpperCase() || "A"
              )}
            </div>

            {/* زر كاميرا الصورة الشخصية */}
            <button
              onClick={() => avatarFileRef.current?.click()}
              className="absolute bottom-1 left-1 bg-slate-100 hover:bg-slate-200 border-2 border-white p-2 rounded-full shadow-lg text-slate-700 transition"
              title="تغيير الصورة أو فيديو 5ث"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={avatarFileRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
        </div>

        {/* تفاصيل الاسم والرتبة والأصدقاء المشتركين */}
        <div className="max-w-lg mx-auto px-4 mt-3 space-y-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{profile?.full_name}</h1>
              {profile?.is_verified && <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50" />}
            </div>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              {friends.length} أصدقاء • {posts.length} منشورات
            </p>
          </div>

          {/* البايو (Bio) */}
          {profile?.bio && (
            <p className="text-xs font-semibold text-slate-700 leading-relaxed italic">
              {profile.bio}
            </p>
          )}

          {/* الحالة الاجتماعية سريعة */}
          {profile?.relationship_status && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-50" />
              <span>{profile.relationship_status}</span>
            </div>
          )}

          {/* رتبة TTT Platform المميزة */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 shadow-sm text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-slate-700">الرتبة:</span>
            <span className="text-orange-600">{profile?.role === "admin" ? "المطور والمؤسس 👑" : "عضو متميز 🌟"}</span>
          </div>

          {/* 🔘 أزرار الإجراءات الرئيسية (Add to story & Edit profile) */}
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
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Edit3 className="w-4 h-4 text-slate-600" />
              <span>تعديل الملف الشخصي</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🟢 2. الفلترة السريعة (All, Photos, Reels) */}
      <div className="max-w-lg mx-auto px-4 mt-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
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
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🟢 3. الأقسام التفصيلية (Personal Details - Facebook Style) */}
      <main className="max-w-lg mx-auto px-4 mt-3 space-y-3">
        
        {/* التفاصيل الشخصية */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-black text-xs text-slate-900">التفاصيل الشخصية</h3>
            <button onClick={() => setIsEditOpen(true)} className="text-slate-400 hover:text-orange-600">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>يقيم في <strong className="text-slate-900">{profile?.location || "الجيزة، مصر"}</strong></span>
            </div>

            <div className="flex items-center gap-2.5">
              <HomeIcon className="w-4 h-4 text-slate-400" />
              <span>من <strong className="text-slate-900">{profile?.location || "الجيزة"}</strong></span>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>تاريخ الميلاد: <strong className="text-slate-900">{profile?.birth_date || "8 نوفمبر 2005"}</strong></span>
            </div>

            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-slate-400" />
              <span>الحالة الاجتماعية: <strong className="text-slate-900">{profile?.relationship_status || "أعزب"}</strong></span>
            </div>
          </div>
        </div>

        {/* التعليم */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-black text-xs text-slate-900">التعليم</h3>
            <button onClick={() => setIsEditOpen(true)} className="text-slate-400 hover:text-orange-600">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-orange-500">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-xs text-slate-900">{profile?.education || "معهد الجيزة العالي للهندسة والتكنولوجيا"}</h4>
              <span className="text-[10px] font-medium text-slate-400">منذ سبتمبر 2025</span>
            </div>
          </div>
        </div>

        {/* الهوايات */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-black text-xs text-slate-900">الاهتمامات والهوايات</h3>
            <button onClick={() => setIsEditOpen(true)} className="text-slate-400 hover:text-orange-600">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Activity className="w-4 h-4 text-orange-500" />
            <span>{editHobbies || "Reading • Listening to Music • Coding"}</span>
          </div>
        </div>

        {/* 👥 قسم الأصدقاء (Friends Grid with Circular Avatars) */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-black text-xs text-slate-900">الأصدقاء</h3>
              <span className="text-[10px] font-bold text-slate-400">{friends.length} صديق</span>
            </div>
            <Link href="/friends" className="text-xs font-bold text-orange-600 hover:underline">
              عرض الكل
            </Link>
          </div>

          {friends.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 text-center py-3">لا يوجد أصدقاء بعد</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 text-center">
              {friends.slice(0, 4).map((friend) => (
                <div key={friend.id} className="space-y-1">
                  <div className="w-14 h-14 mx-auto rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm border-2 border-orange-500 shadow-sm overflow-hidden">
                    {friend.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-[10px] text-slate-800 truncate">{friend.full_name}</h4>
                  <span className="text-[8px] text-slate-400 block font-medium">صديق مشترك</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🌟 القصص المثبتة / الهايلايت (Highlights) */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="font-black text-xs text-slate-900">القصص المميزة (Highlights)</h3>
          
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            {/* زر إضافة Highlight جديد */}
            <div className="flex-shrink-0 w-20 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-orange-50/50 transition">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-black">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600">جديد</span>
            </div>

            {highlights.map((h) => (
              <div
                key={h.id}
                className="flex-shrink-0 w-20 h-32 rounded-2xl relative overflow-hidden border border-slate-200 shadow-sm group cursor-pointer"
              >
                <img src={h.image} alt={h.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                  <span className="text-[9px] font-bold text-white truncate w-full">{h.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ✏️ صندوق إنشاء منشور (What's on your mind) */}
        <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs border border-orange-500">
              {profile?.full_name?.charAt(0).toUpperCase() || "A"}
            </div>
            <input
              type="text"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="بم تفكر؟"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-orange-500"
            />
            <label className="cursor-pointer text-slate-500 hover:text-orange-500 p-1">
              <ImageIcon className="w-5 h-5 text-emerald-500" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setSelectedMedia(URL.createObjectURL(f));
                }}
              />
            </label>
          </div>

          {selectedMedia && (
            <div className="relative rounded-2xl overflow-hidden max-h-40 border border-slate-200">
              <img src={selectedMedia} alt="Media" className="w-full object-cover max-h-40" />
              <button onClick={() => setSelectedMedia(null)} className="absolute top-2 left-2 bg-black/70 text-white p-1 rounded-full">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 p-1.5 rounded-xl transition">
              <Video className="w-4 h-4 text-rose-500" />
              <span>ريلز (Reel)</span>
            </button>
            <button className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 p-1.5 rounded-xl transition">
              <Radio className="w-4 h-4 text-red-600" />
              <span>بث مباشر (Live)</span>
            </button>
          </div>

          {(postText.trim() || selectedMedia) && (
            <button
              onClick={handleCreatePost}
              disabled={isPosting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm"
            >
              {isPosting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "نشر الآن"}
            </button>
          )}
        </div>

        {/* 📰 المنشورات الخاصة بالمستخدم (All Posts) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xs text-slate-900">كل المنشورات</h3>
            <span className="text-[11px] font-bold text-orange-600 cursor-pointer">إدارة المنشورات</span>
          </div>

          {posts.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center shadow-sm">
              <p className="text-xs font-bold text-slate-400">لا توجد منشورات حتى الآن</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs border border-orange-500">
                      {profile?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="font-black text-xs text-slate-900">{profile?.full_name}</h4>
                        {profile?.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(post.created_at).toLocaleDateString("ar-EG")} • 🌐
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
              </div>
            ))
          )}
        </div>

      </main>

      {/* 🟢 4. نافذة تعديل البروفايل الكاملة */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-3.5 shadow-2xl text-right max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900">تعديل الملف الشخصي</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-2.5 text-xs font-bold">
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

              <div>
                <label className="text-slate-600 block mb-1">الحالة الاجتماعية</label>
                <select
                  value={editRelationship}
                  onChange={(e) => setEditRelationship(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                >
                  <option value="Single">Single (أعزب)</option>
                  <option value="In a relationship">In a relationship (مرتبط)</option>
                  <option value="Engaged">Engaged (مخطوب)</option>
                  <option value="Married">Married (متزوج)</option>
                </select>
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
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md shadow-orange-500/20 mt-1"
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