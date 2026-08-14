"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
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
  Image as ImageIcon,
  Send,
  Plus,
  Video,
  Radio,
  ChevronDown,
  Activity,
  ThumbsUp,
  MessageCircle,
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
  media_type?: "image" | "video";
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

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // تبويب الفلترة النشط (الكل / الصور / الريلز)
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

  // كتابة منشور جديد
  const [postText, setPostText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<"image" | "video">("image");
  const [isPosting, setIsPosting] = useState(false);

  // المراجع لرفع الملفات
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const storyFileRef = useRef<HTMLInputElement>(null);

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

    // 1. جلب بيانات البروفايل الحقيقية من Supabase
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (prof) {
      setProfile(prof);
      setEditFullName(prof.full_name || "");
      setEditBio(prof.bio || "");
      setEditLocation(prof.location || "");
      setEditEducation(prof.education || "");
      setEditRelationship(prof.relationship_status || "أعزب");
      setEditBirthDate(prof.birth_date || "");
      setEditHobbies(prof.hobbies && prof.hobbies.length > 0 ? prof.hobbies.join(" • ") : "");
    }

    // 2. جلب منشورات المستخدم الحقيقية مرتبة من الأحدث للأقدم
    const { data: myPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (myPosts) setPosts(myPosts);

    // 3. جلب الأصدقاء الفعليين المقبولين من جدول العلاقات
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

  // دالة تحجيم وضغط الصور لضمان الحفظ الدائم بدون تخطي السعة
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 📷 رفع وحفظ الصورة الشخصية الحقيقية في Supabase
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = async () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 5.5) {
            alert("عذراً، يجب ألا تزيد مدة الفيديو عن 5 ثوانٍ كصورة شخصية متحركة.");
            return;
          }
          const reader = new FileReader();
          reader.onload = async () => {
            const finalUrl = reader.result as string;
            setProfile((prev) => (prev ? { ...prev, avatar_url: finalUrl, avatar_type: "video" } : null));
            await supabase
              .from("profiles")
              .update({ avatar_url: finalUrl, avatar_type: "video" })
              .eq("id", profile.id);
          };
          reader.readAsDataURL(file);
        };
        video.src = URL.createObjectURL(file);
      } else {
        const compressed = await compressImage(file);
        setProfile((prev) => (prev ? { ...prev, avatar_url: compressed, avatar_type: "image" } : null));
        await supabase
          .from("profiles")
          .update({ avatar_url: compressed, avatar_type: "image" })
          .eq("id", profile.id);
      }
    } catch (err) {
      console.error("Avatar upload exception:", err);
    }
  };

  // 🌄 رفع وحفظ صورة الغلاف الحقيقية في Supabase
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      const compressed = await compressImage(file);
      setProfile((prev) => (prev ? { ...prev, cover_url: compressed } : null));
      await supabase
        .from("profiles")
        .update({ cover_url: compressed })
        .eq("id", profile.id);
    } catch (err) {
      console.error("Cover upload exception:", err);
    }
  };

  // 📖 نشر قصة في قاعدة البيانات
  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      const mediaData = await compressImage(file);
      await supabase.from("stories").insert([
        {
          user_id: profile.id,
          media_url: mediaData,
          caption: "قصة من البروفايل",
          created_at: new Date().toISOString(),
        },
      ]);
      alert("تم نشر القصة بنجاح وستظهر في الصفحة الرئيسية! 🚀");
    } catch (err) {
      console.error("Story upload exception:", err);
    }
  };

  // 📝 نشر منشور جديد وحفظه في جدول posts
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || (!postText.trim() && !selectedMedia)) return;

    setIsPosting(true);
    const postPayload = {
      user_id: profile.id,
      content: postText.trim(),
      media_urls: selectedMedia ? [selectedMedia] : [],
      media_type: selectedMediaType,
      visibility: "public",
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("posts").insert([postPayload]).select().single();

    if (!error && data) {
      setPosts([data, ...posts]);
      setPostText("");
      setSelectedMedia(null);
    }
    setIsPosting(false);
  };

  // 💾 حفظ تعديلات الملف الشخصي في قاعدة البيانات
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
      birth_date: editBirthDate || null,
      hobbies: editHobbies ? editHobbies.split("•").map((s) => s.trim()).filter(Boolean) : [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").update(updatePayload).eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, ...updatePayload });
      setIsEditOpen(false);
    } else {
      alert("حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى.");
    }
    setIsSaving(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("هل تريد حذف هذا المنشور نهائياً؟")) {
      setPosts(posts.filter((p) => p.id !== postId));
      await supabase.from("posts").delete().eq("id", postId);
    }
  };

  // تجميع جميع الصور الفعلية المرفوعة
  const allUserPhotos = [
    ...(profile?.avatar_url && profile.avatar_type !== "video" ? [profile.avatar_url] : []),
    ...(profile?.cover_url ? [profile.cover_url] : []),
    ...posts.flatMap((p) => (p.media_urls && p.media_type !== "video" ? p.media_urls : [])),
  ];

  // تجميع جميع مقاطع الريلز / الفيديوهات الفعلية
  const allUserReels = posts.filter(
    (p) => p.media_type === "video" || p.media_urls?.some((url) => url.startsWith("data:video") || url.endsWith(".mp4"))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 font-sans select-none pb-24 text-right" dir="rtl">
      
      {/* 🟢 1. منطقة الغلاف والصورة والهيدر بمحاذاة مظبوطة */}
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

          {/* زر كاميرا تغيير الغلاف */}
          <button
            type="button"
            onClick={() => coverFileRef.current?.click()}
            className="absolute bottom-3 left-3 z-20 bg-slate-900/80 hover:bg-slate-900 text-white p-2.5 rounded-full backdrop-blur-md transition shadow cursor-pointer"
            title="تغيير صورة الغلاف"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
          <input
            ref={coverFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />
        </div>

        {/* الصورة الشخصية وبجانبها الاسم بمحاذاة منتصف الصورة */}
        <div className="max-w-lg mx-auto px-4 -mt-12 relative flex items-center gap-3">
          
          <div className="relative flex-shrink-0 z-10">
            <div className="w-24 h-24 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-3xl border-4 border-white shadow-lg overflow-hidden">
              {profile?.avatar_url ? (
                profile.avatar_type === "video" || profile.avatar_url.startsWith("data:video") ? (
                  <video src={profile.avatar_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={profile.avatar_url} alt="الصورة الشخصية" className="w-full h-full object-cover" />
                )
              ) : (
                profile?.full_name?.charAt(0).toUpperCase() || "U"
              )}
            </div>

            {/* زر كاميرا الصورة الشخصية */}
            <button
              type="button"
              onClick={() => avatarFileRef.current?.click()}
              className="absolute bottom-0 left-0 z-20 bg-slate-100 hover:bg-slate-200 border-2 border-white p-1.5 rounded-full shadow text-slate-800 transition cursor-pointer"
              title="تغيير الصورة أو فيديو متحرك 5ث"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              ref={avatarFileRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* الاسم ومُعرّف الحساب بمحاذاة منتصف الصورة تماماً */}
          <div className="pt-12 space-y-0.5 text-right">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{profile?.full_name || "مستخدم"}</h1>
              {profile?.is_verified && <BadgeCheck className="w-5 h-5 text-orange-500 fill-orange-100" />}
            </div>
            <span className="text-[11px] font-bold text-slate-400 block text-right" dir="ltr">
              #{profile?.user_number_id || "000000"}
            </span>
          </div>

        </div>

        {/* الرتبة والمسافة الفاصلة + البايو + أزرار الإجراءات */}
        <div className="max-w-lg mx-auto px-4 mt-3 space-y-3">
          
          {/* شارة الرتبة والإحصائيات بالعربي مع مسافة فاصلة */}
          <div className="flex items-center justify-between pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-xs font-black shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-slate-700">الرتبة:</span>
              <span className="text-orange-600">{profile?.role === "admin" ? "المطور والمؤسس 👑" : "عضو متميز 🌟"}</span>
            </div>

            <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <span>{friends.length} أصدقاء</span>
              <span>•</span>
              <span>{posts.length} منشورات</span>
            </div>
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

          {/* 🔘 أزرار الإجراءات الرئيسية */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => storyFileRef.current?.click()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة إلى القصة</span>
            </button>
            <input ref={storyFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleStoryUpload} />

            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-200 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-slate-600" />
              <span>تعديل الملف الشخصي</span>
            </button>
          </div>

        </div>
      </div>

      {/* 🟢 2. أزرار الفلترة الشغالة (الكل / الصور / الريلز) */}
      <div className="max-w-lg mx-auto px-4 mt-3">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "الكل" },
            { id: "photos", label: `الصور (${allUserPhotos.length})` },
            { id: "reels", label: `الريلز (${allUserReels.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-5 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                filterType === tab.id
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🟢 3. محتوى الصفحة حسب الفلتر المختار */}
      <main className="max-w-lg mx-auto px-4 mt-3 space-y-3">
        
        {/* 📸 عند اختيار فلتر الصور */}
        {filterType === "photos" && (
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="font-black text-xs text-slate-900">جميع الصور ({allUserPhotos.length})</h3>
            {allUserPhotos.length === 0 ? (
              <p className="text-center text-xs font-bold text-slate-400 py-6">لا توجد صور منشورة بعد</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {allUserPhotos.map((imgUrl, idx) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm group">
                    <img src={imgUrl} alt={`Photo ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🎬 عند اختيار فلتر الريلز */}
        {filterType === "reels" && (
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="font-black text-xs text-slate-900">مقاطع الريلز ({allUserReels.length})</h3>
            {allUserReels.length === 0 ? (
              <p className="text-center text-xs font-bold text-slate-400 py-6">لا توجد مقاطع ريلز منشورة بعد</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {allUserReels.map((reel) => (
                  <div key={reel.id} className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-black">
                    <video src={reel.media_urls?.[0]} className="w-full h-full object-cover" controls playsInline />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 📑 عند اختيار فلتر "الكل" */}
        {filterType === "all" && (
          <>
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
                  <span>يقيم في <strong className="text-slate-900">{profile?.location || "غير محدد"}</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <HomeIcon className="w-4 h-4 text-orange-500" />
                  <span>من <strong className="text-slate-900">{profile?.location || "غير محدد"}</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span>تاريخ الميلاد: <strong className="text-slate-900">{profile?.birth_date || "غير محدد"}</strong></span>
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
                  <p className="font-black text-slate-900">{profile?.education || "غير محدد"}</p>
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
                <span>{editHobbies || "لم يتم تحديد هوايات"}</span>
              </div>
            </div>

            {/* الأصدقاء الفعليون */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xs text-slate-900">الأصدقاء ({friends.length})</h3>
                <Link href="/friends" className="text-xs font-bold text-orange-600 hover:underline">
                  عرض الكل
                </Link>
              </div>

              {friends.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 text-center py-2">لا يوجد أصدقاء مضافين حتى الآن</p>
              ) : (
                <div className="grid grid-cols-4 gap-2 text-center">
                  {friends.slice(0, 4).map((f) => (
                    <Link
                      key={f.id}
                      href={`/profile/${f.id}`}
                      className="space-y-1 block hover:scale-105 transition"
                    >
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs border border-orange-500 overflow-hidden">
                        {f.avatar_url ? (
                          <img src={f.avatar_url} alt={f.full_name} className="w-full h-full object-cover" />
                        ) : (
                          f.full_name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <p className="font-bold text-[10px] text-slate-900 truncate">{f.full_name}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* كتابة منشور جديد */}
            <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs flex-shrink-0">
                  {profile?.full_name?.charAt(0).toUpperCase() || "U"}
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
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const dataUrl = await compressImage(f);
                        setSelectedMedia(dataUrl);
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
                <button
                  type="button"
                  onClick={() => setFilterType("reels")}
                  className="flex items-center justify-center gap-1 text-xs font-bold text-slate-700 py-1 hover:bg-slate-50 rounded-xl"
                >
                  <Video className="w-4 h-4 text-orange-500" />
                  <span>ريلز (Reel)</span>
                </button>
                <button type="button" className="flex items-center justify-center gap-1 text-xs font-bold text-slate-700 py-1 hover:bg-slate-50 rounded-xl">
                  <Radio className="w-4 h-4 text-red-500" />
                  <span>بث مباشر</span>
                </button>
              </div>

              {(postText.trim() || selectedMedia) && (
                <button
                  type="button"
                  onClick={handleCreatePost}
                  disabled={isPosting}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-xs transition shadow-sm shadow-orange-500/20"
                >
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "نشر الآن"}
                </button>
              )}
            </div>

            {/* فيد المنشورات الفعلي */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xs text-slate-900">المنشورات ({posts.length})</h3>
                <span className="text-[11px] font-bold text-orange-600 cursor-pointer">إدارة المنشورات</span>
              </div>

              {posts.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center shadow-sm">
                  <p className="text-xs font-bold text-slate-400">لا توجد منشورات منشورة حتى الآن</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs border border-orange-500 overflow-hidden">
                          {profile?.avatar_url && profile.avatar_type !== "video" ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            profile?.full_name?.charAt(0).toUpperCase() || "U"
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="font-black text-xs text-slate-900">{profile?.full_name || "مستخدم"}</h4>
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

                    {post.content && <p className="text-xs font-medium text-slate-800 leading-relaxed">{post.content}</p>}

                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className="rounded-2xl overflow-hidden border border-slate-100">
                        {post.media_type === "video" || post.media_urls[0].startsWith("data:video") ? (
                          <video src={post.media_urls[0]} controls className="w-full max-h-80" />
                        ) : (
                          <img src={post.media_urls[0]} alt="Media" className="w-full object-cover max-h-80" />
                        )}
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
          </>
        )}

      </main>

      {/* 🟢 4. نافذة تعديل البروفايل */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-3.5 shadow-2xl text-right max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900">تعديل الملف الشخصي</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-700">
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

              {/* القائمة المنسدلة بهوية المنصة */}
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
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md shadow-orange-500/20 mt-2 cursor-pointer"
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