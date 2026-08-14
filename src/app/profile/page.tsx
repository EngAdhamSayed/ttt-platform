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
  Pin,
  MessageCircle,
  ThumbsUp,
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

interface Story {
  id: string;
  media_url: string;
  caption?: string;
}

export default function ProfilePage() {
  const router = useRouter();

  // بيانات المستخدم الحقيقية
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [highlights, setHighlights] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // التبويب (All, Photos, Reels)
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

  // إنشاء منشور
  const [postText, setPostText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const avatarFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

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

    // 1. جلب بيانات البروفايل من Supabase
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (prof) {
      setProfile(prof);
      setEditFullName(prof.full_name || "");
      setEditBio(prof.bio || "");
      setEditLocation(prof.location || "");
      setEditEducation(prof.education || "");
      setEditRelationship(prof.relationship_status || "");
      setEditBirthDate(prof.birth_date || "");
      setEditHobbies(prof.hobbies ? prof.hobbies.join(" • ") : "");
    }

    // 2. جلب المنشورات الحقيقية الخاصة بالمستخدم
    const { data: myPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (myPosts) setPosts(myPosts);

    // 3. جلب الأصدقاء الحقيقيين من جدول friendships
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

    // 4. جلب القصص الحقيقية للمستخدم (الهايلايتس)
    const { data: storiesData } = await supabase
      .from("stories")
      .select("id, media_url, caption")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (storiesData) setHighlights(storiesData);

    setLoading(false);
  };

  // 🎥 رفع صورة شخصية أو فيديو متحرك لا يزيد عن 5 ثواني
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

  // 🗑️ حذف منشور
  const handleDeletePost = async (postId: string) => {
    if (confirm("هل تريد حذف هذا المنشور نهائياً؟")) {
      setPosts(posts.filter((p) => p.id !== postId));
      await supabase.from("posts").delete().eq("id", postId);
    }
  };

  // 💾 حفظ تعديلات البيانات الشخصية في Supabase
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    const hobbiesArray = editHobbies
      ? editHobbies.split("•").map((s) => s.trim()).filter(Boolean)
      : [];

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

  // تصفية المنشورات حسب التبويب
  const filteredPosts = posts.filter((p) => {
    if (filterType === "photos") return p.media_urls && p.media_urls.length > 0;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1877f2]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#050505] font-sans pb-20 select-none">
      
      {/* 🔹 1. الهيدر والغلاف والصورة الشخصية */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        
        {/* الغلاف (Cover Photo) */}
        <div className="h-44 md:h-52 w-full bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 relative">
          {profile?.cover_url ? (
            <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30 text-2xl font-black">
              TTT PLATFORM
            </div>
          )}

          <button
            onClick={() => coverFileRef.current?.click()}
            className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition shadow"
            title="تعديل صورة الغلاف"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

          <button className="absolute top-3 left-3 bg-white/90 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-full shadow backdrop-blur-sm">
            Share a note...
          </button>
        </div>

        {/* الصورة الشخصية والمعلومات */}
        <div className="max-w-lg mx-auto px-4 -mt-14 relative pb-4">
          <div className="flex items-end justify-between">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-3xl border-4 border-white shadow-lg overflow-hidden relative">
                {profile?.avatar_url ? (
                  profile.avatar_type === "video" || profile.avatar_url.endsWith(".mp4") ? (
                    <video src={profile.avatar_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  )
                ) : (
                  profile?.full_name?.charAt(0).toUpperCase() || "U"
                )}
              </div>

              {/* زر كاميرا الصورة الشخصية */}
              <button
                onClick={() => avatarFileRef.current?.click()}
                className="absolute bottom-0 right-0 bg-gray-200 hover:bg-gray-300 border-2 border-white p-1.5 rounded-full shadow text-slate-800 transition"
                title="تغيير الصورة أو فيديو 5ث"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input ref={avatarFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-slate-700 cursor-pointer">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>

          {/* الاسم والتوثيق والبيانات */}
          <div className="mt-2.5 space-y-1 text-left">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold text-slate-900">{profile?.full_name || "مستخدم TTT"}</h1>
              {profile?.is_verified && <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50" />}
            </div>
            
            <p className="text-xs font-semibold text-gray-500">
              {friends.length} أصدقاء • {posts.length} منشورات
            </p>

            {profile?.bio && (
              <p className="text-xs font-normal text-slate-800 whitespace-pre-line pt-1">
                {profile.bio}
              </p>
            )}

            {profile?.relationship_status && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 pt-0.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{profile.relationship_status}</span>
              </div>
            )}

            {/* الأصدقاء المشتركون الفعليون */}
            {friends.length > 0 && (
              <div className="flex items-center gap-2 pt-1 text-xs text-gray-500 font-medium">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {friends.slice(0, 3).map((f) => (
                    <div key={f.id} className="w-5 h-5 rounded-full bg-slate-900 text-amber-400 text-[8px] font-black flex items-center justify-center border border-white">
                      {f.full_name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                <span className="text-[11px]">{friends.length} أصدقاء في المنصة</span>
              </div>
            )}

            {/* الرتبة الحقيقية */}
            <div className="pt-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                <Sparkles className="w-3 h-3 text-amber-500" />
                الرتبة: {profile?.role === "admin" ? "المطور والمؤسس 👑" : profile?.rank_tier || "عضو"}
              </span>
            </div>
          </div>

          {/* أزرار الإجراءات الرئيسية */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => router.push("/")}
              className="bg-[#1877f2] hover:bg-blue-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add to story</span>
            </button>

            <button
              onClick={() => setIsEditOpen(true)}
              className="bg-gray-200 hover:bg-gray-300 text-slate-900 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 2. التبويبات السريعة (All, Photos, Reels) */}
      <div className="max-w-lg mx-auto px-4 mt-2">
        <div className="flex items-center gap-2">
          {["All", "Photos", "Reels"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab.toLowerCase() as any)}
              className={`px-4 py-1 rounded-full text-xs font-bold transition ${
                filterType === tab.toLowerCase()
                  ? "bg-blue-100 text-[#1877f2]"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 🔹 3. الأقسام التفصيلية */}
      <main className="max-w-lg mx-auto px-4 mt-3 space-y-3">
        
        {/* Personal details */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm space-y-2.5 text-left">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
            <h3 className="font-bold text-xs text-slate-900">Personal details</h3>
            <button onClick={() => setIsEditOpen(true)} className="text-gray-400 hover:text-slate-800">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs text-slate-700 font-medium">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{profile?.location || "لم يتم تحديد الموقع"}</span>
            </div>
            {profile?.birth_date && (
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{profile.birth_date}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-gray-500" />
              <span>{profile?.relationship_status || "غير محدد"}</span>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm space-y-2.5 text-left">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
            <h3 className="font-bold text-xs text-slate-900">Education</h3>
            <button onClick={() => setIsEditOpen(true)} className="text-gray-400 hover:text-slate-800">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <GraduationCap className="w-4 h-4 text-gray-500 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">{profile?.education || "لم تتم إضافة التعليم بعد"}</p>
            </div>
          </div>
        </div>

        {/* Hobbies */}
        {profile?.hobbies && profile.hobbies.length > 0 && (
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm space-y-2.5 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
              <h3 className="font-bold text-xs text-slate-900">Hobbies</h3>
              <button onClick={() => setIsEditOpen(true)} className="text-gray-400 hover:text-slate-800">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
              <Activity className="w-4 h-4 text-gray-500" />
              <span>{profile.hobbies.join(" • ")}</span>
            </div>
          </div>
        )}

        {/* Friends */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900">Friends</h3>
            <Link href="/friends" className="text-xs font-bold text-[#1877f2]">See all</Link>
          </div>

          {friends.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 text-center py-2">لا يوجد أصدقاء بعد</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 text-center">
              {friends.slice(0, 4).map((friend) => (
                <div key={friend.id} className="space-y-1">
                  <div className="w-14 h-14 mx-auto rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm border border-gray-200">
                    {friend.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-bold text-[10px] text-slate-900 truncate">{friend.full_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm space-y-2.5">
            <h3 className="font-bold text-xs text-slate-900 text-left">Highlights</h3>
            
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <div
                onClick={() => router.push("/")}
                className="flex-shrink-0 w-20 h-32 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-gray-600">New</span>
              </div>

              {highlights.map((h) => (
                <div key={h.id} className="flex-shrink-0 w-20 h-32 rounded-xl relative overflow-hidden border border-gray-200 bg-slate-900">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                    <span className="text-[9px] font-bold text-white truncate w-full text-center">{h.caption || "Highlight"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All posts & What's on your mind */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900">All posts</h3>
            <span className="text-xs font-bold text-[#1877f2] cursor-pointer">Filters</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                {profile?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <input
                type="text"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's on your mind?"
                className="flex-1 bg-transparent text-xs font-medium text-slate-800 placeholder-gray-400 focus:outline-none"
              />
              <label className="cursor-pointer">
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

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <button className="flex items-center justify-center gap-1 text-xs font-bold text-slate-700 py-1 hover:bg-gray-50 rounded-lg">
                <Video className="w-4 h-4 text-rose-500" />
                <span>Reel</span>
              </button>
              <button className="flex items-center justify-center gap-1 text-xs font-bold text-slate-700 py-1 hover:bg-gray-50 rounded-lg">
                <Radio className="w-4 h-4 text-red-600" />
                <span>Live</span>
              </button>
            </div>

            {(postText.trim() || selectedMedia) && (
              <button
                onClick={handleCreatePost}
                disabled={isPosting}
                className="w-full bg-[#1877f2] hover:bg-blue-600 text-white font-bold py-1.5 rounded-xl text-xs transition"
              >
                {isPosting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Post"}
              </button>
            )}
          </div>
        </div>

        {/* عرض المنشورات الفعلية للمستخدم */}
        <div className="space-y-3 pt-1">
          {filteredPosts.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center shadow-sm">
              <p className="text-xs font-bold text-slate-400">لا توجد منشورات حتى الآن</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 space-y-2.5 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                      {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{profile?.full_name}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                        <span>{new Date(post.created_at).toLocaleDateString("ar-EG")} • 🌐</span>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs font-semibold text-slate-800">{post.content}</p>

                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="rounded-xl overflow-hidden border border-gray-100">
                    <img src={post.media_urls[0]} alt="Post media" className="w-full object-cover max-h-80" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-gray-500 text-xs font-bold border-t border-gray-100">
                  <button className="flex items-center gap-1 hover:text-blue-600"><ThumbsUp className="w-3.5 h-3.5" /> Like</button>
                  <button className="flex items-center gap-1 hover:text-blue-600"><MessageCircle className="w-3.5 h-3.5" /> Comment</button>
                  <button className="flex items-center gap-1 hover:text-blue-600"><Share2 className="w-3.5 h-3.5" /> Share</button>
                </div>
              </div>
            ))
          )}
        </div>

      </main>

      {/* 🔹 4. نافذة التعديل */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-3 shadow-2xl text-left max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Edit Profile</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-2.5 text-xs font-bold">
              <div>
                <label className="text-gray-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-gray-600 block mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="text-gray-600 block mb-1">Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-gray-600 block mb-1">Education</label>
                <input
                  type="text"
                  value={editEducation}
                  onChange={(e) => setEditEducation(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-gray-600 block mb-1">Relationship Status</label>
                <select
                  value={editRelationship}
                  onChange={(e) => setEditRelationship(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="">غير محدد</option>
                  <option value="Single">Single (أعزب)</option>
                  <option value="In a relationship">In a relationship (مرتبط)</option>
                  <option value="Engaged">Engaged (مخطوب)</option>
                  <option value="Married">Married (متزوج)</option>
                </select>
              </div>

              <div>
                <label className="text-gray-600 block mb-1">Hobbies</label>
                <input
                  type="text"
                  value={editHobbies}
                  onChange={(e) => setEditHobbies(e.target.value)}
                  placeholder="Reading • Listening to Music • Coding"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-[#1877f2] hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs transition mt-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}