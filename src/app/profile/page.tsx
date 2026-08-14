"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  Camera,
  Edit3,
  Sparkles,
  Share2,
  Trash2,
  Loader2,
  X,
  Image as ImageIcon,
  Plus,
  Video,
  Radio,
  ChevronDown,
  ThumbsUp,
  MessageCircle,
  StickyNote,
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
  note?: string;
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

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // تبويب الفلترة النشط (الكل / الصور / الريلز)
  const [filterType, setFilterType] = useState<"all" | "photos" | "reels">("all");

  // نافذة الملاحظة (Note)
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // نافذة تعديل البروفايل
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editRelationship, setEditRelationship] = useState("أعزب");
  const [isRelDropdownOpen, setIsRelDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // نشر منشور جديد
  const [postText, setPostText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<"image" | "video">("image");
  const [isPosting, setIsPosting] = useState(false);

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

    // جلب بيانات البروفايل
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (prof) {
      setProfile(prof);
      setEditFullName(prof.full_name || "مستخدم TTT");
      setEditBio(prof.bio || "");
      setEditRelationship(prof.relationship_status || "أعزب");
      setNoteText(prof.note || "");
    }

    // جلب منشورات المستخدم
    const { data: myPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (myPosts) setPosts(myPosts);

    // جلب الأصدقاء
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

  // دالة تحويل الصورة لـ Base64 / Storage لحفظها الدائم في قاعدة البيانات
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 📷 حفظ ورفع الصورة الشخصية بشكل دائم في DB
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      const isVid = file.type.startsWith("video/");
      const avatarType = isVid ? "video" : "image";

      setProfile({ ...profile, avatar_url: dataUrl, avatar_type: avatarType });

      await supabase
        .from("profiles")
        .update({ avatar_url: dataUrl, avatar_type: avatarType })
        .eq("id", profile.id);
    } catch (err) {
      console.error("Error uploading avatar:", err);
    }
  };

  // 🌄 حفظ ورفع صورة الغلاف بشكل دائم في DB
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setProfile({ ...profile, cover_url: dataUrl });

      await supabase
        .from("profiles")
        .update({ cover_url: dataUrl })
        .eq("id", profile.id);
    } catch (err) {
      console.error("Error uploading cover:", err);
    }
  };

  // 📝 حفظ الملاحظة السريعة
  const handleSaveNote = async () => {
    if (!profile) return;
    setIsSavingNote(true);
    await supabase.from("profiles").update({ note: noteText.trim() }).eq("id", profile.id);
    setProfile({ ...profile, note: noteText.trim() });
    setIsSavingNote(false);
    setIsNoteOpen(false);
  };

  // 📖 إضافة قصة جديدة (Story)
  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      const isVid = file.type.startsWith("video/");
      await supabase.from("stories").insert([
        {
          user_id: profile.id,
          media_url: dataUrl,
          media_type: isVid ? "video" : "image",
          created_at: new Date().toISOString(),
        },
      ]);
      alert("تمت إضافة القصة بنجاح! 🚀");
    } catch (err) {
      console.error("Error adding story:", err);
    }
  };

  // 📝 نشر منشور جديد
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
    };

    const { data, error } = await supabase.from("posts").insert([postPayload]).select().single();

    if (!error && data) {
      setPosts([data, ...posts]);
      setPostText("");
      setSelectedMedia(null);
    }
    setIsPosting(false);
  };

  // 💾 حفظ تعديلات الملف الشخصي
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    const updatePayload = {
      full_name: editFullName.trim(),
      bio: editBio.trim(),
      relationship_status: editRelationship,
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

  // 🔍 الفلترة التفاعلية الحقيقية للمنشورات
  const filteredPosts = posts.filter((p) => {
    if (filterType === "photos") {
      return p.media_urls && p.media_urls.length > 0 && p.media_type !== "video";
    }
    if (filterType === "reels") {
      return p.media_type === "video" || (p.media_urls && p.media_urls.some(url => url.startsWith("data:video") || url.endsWith(".mp4")));
    }
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
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 font-sans select-none pb-24 text-right" dir="rtl">
      
      {/* 🟢 1. منطقة الغلاف والصورة والهيدر المعدل بالكامل */}
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
            onClick={() => coverFileRef.current?.click()}
            className="absolute bottom-3 left-3 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md transition shadow cursor-pointer"
            title="تغيير صورة الغلاف"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

          {/* زر الملاحظة (شغال الآن) */}
          <button
            onClick={() => setIsNoteOpen(true)}
            className="absolute top-3 right-3 bg-white/95 hover:bg-white text-slate-800 text-[11px] font-black px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <StickyNote className="w-3.5 h-3.5 text-orange-500" />
            <span>{profile?.note ? profile.note : "ملاحظة..."}</span>
          </button>
        </div>

        {/* الهيدر: الصورة + الاسم على اليمين مباشرة | زر التعديل على الشمال خالص */}
        <div className="max-w-lg mx-auto px-4 -mt-12 relative flex items-end justify-between gap-2">
          
          {/* الصورة الشخصية والاسم بجانبها */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-3xl border-4 border-white shadow-lg overflow-hidden">
                {profile?.avatar_url ? (
                  profile.avatar_type === "video" || profile.avatar_url.startsWith("data:video") ? (
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
                className="absolute bottom-0 left-0 bg-slate-100 hover:bg-slate-200 border-2 border-white p-1.5 rounded-full shadow text-slate-800 transition cursor-pointer"
                title="تغيير الصورة الشخصية"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input ref={avatarFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* الاسم ومُعرّف الحساب ملاصقين للصورة */}
            <div className="space-y-0.5 text-right">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">{profile?.full_name}</h1>
                {profile?.is_verified && <BadgeCheck className="w-5 h-5 text-orange-500 fill-orange-100" />}
              </div>
              <span className="text-[11px] font-bold text-slate-400 block text-right" dir="ltr">
                #{profile?.user_number_id || "000000"}
              </span>
            </div>
          </div>

          {/* الزر البنفسجي المنقول لأقصى اليسار: تعديل الملف الشخصي */}
          <button
            onClick={() => setIsEditOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-black px-3 py-2 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-200 shadow-sm cursor-pointer mb-1"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span className="whitespace-nowrap">تعديل</span>
          </button>
        </div>

        {/* الرتبة والرانك + البايو + زر القصة */}
        <div className="max-w-lg mx-auto px-4 mt-3 space-y-2.5">
          
          {/* الرتبة مع الرانك */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-xs font-black shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-slate-700">الرتبة:</span>
              <span className="text-orange-600">{profile?.role === "admin" ? "المطور والمؤسس 👑" : "عضو متميز 🌟"}</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              {friends.length} أصدقاء • {posts.length} منشورات
            </span>
          </div>

          {/* البايو */}
          {profile?.bio && (
            <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              {profile.bio}
            </p>
          )}

          {/* زر إضافة إلى القصة (شغال بالكامل) */}
          <div className="pt-1">
            <button
              onClick={() => storyFileRef.current?.click()}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة إلى القصة</span>
            </button>
            <input ref={storyFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleStoryUpload} />
          </div>

        </div>
      </div>

      {/* 🟢 2. أزرار الفلترة الحقيقية الشغالة (الكل / الصور / الريلز) */}
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

      {/* 🟢 3. المحتوى الأساسي (الأصدقاء + كتابة منشور + المنشورات المفلترة) */}
      <main className="max-w-lg mx-auto px-4 mt-3 space-y-3">
        
        {/* قسم الأصدقاء */}
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
            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs flex-shrink-0">
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
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const dataUrl = await fileToDataUrl(f);
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
              onClick={() => {
                setFilterType("reels");
                alert("تم تفعيل فلترة الريلز 🎬");
              }}
              className="flex items-center justify-center gap-1 text-xs font-bold text-slate-700 py-1 hover:bg-slate-50 rounded-xl"
            >
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

        {/* عرض المنشورات بعد الفلترة الحقيقية */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xs text-slate-900">
              {filterType === "all" && `كل المنشورات (${filteredPosts.length})`}
              {filterType === "photos" && `الصور فقط (${filteredPosts.length})`}
              {filterType === "reels" && `الريلز فقط (${filteredPosts.length})`}
            </h3>
            <span className="text-[11px] font-bold text-orange-600">إدارة المنشورات</span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center shadow-sm">
              <p className="text-xs font-bold text-slate-400">لا توجد عناصر مطابقة في هذا التبويب</p>
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

      </main>

      {/* 🟢 4. نافذة الملاحظة السريعة (Note Modal) */}
      {isNoteOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-3.5 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <StickyNote className="w-4 h-4 text-orange-500" />
                <span>ملاحظة الملف الشخصي</span>
              </h3>
              <button onClick={() => setIsNoteOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="اكتب فكرة سريعة أو حالة يراها أصدقاؤك على ملفك الشخصي..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold focus:outline-none focus:border-orange-500 resize-none"
            />

            <button
              onClick={handleSaveNote}
              disabled={isSavingNote}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-2xl text-xs transition shadow-md shadow-orange-500/20"
            >
              {isSavingNote ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "حفظ الملاحظة"}
            </button>
          </div>
        </div>
      )}

      {/* 🟢 5. نافذة تعديل البروفايل */}
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

              {/* القائمة المنسدلة المخصصة بالهوية */}
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