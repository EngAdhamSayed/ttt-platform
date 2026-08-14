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
  Search,
  Activity,
  Menu,
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

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // التبويبات السريعة (All, Photos, Reels)
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

  // كتابة منشور
  const [postText, setPostText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const avatarFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  // الهايلايتس الدائمة
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

    // جلب بيانات الحساب
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (prof) {
      setProfile(prof);
      setEditFullName(prof.full_name || "adham sayed");
      setEditBio(prof.bio || "you can feel fog ✨\nel_fox");
      setEditLocation(prof.location || "Giza");
      setEditEducation(prof.education || "معهد الجيزة العالي للهندسة والتكنولوجيا");
      setEditRelationship(prof.relationship_status || "Single");
      setEditBirthDate(prof.birth_date || "November 8, 2005");
      setEditHobbies(prof.hobbies ? prof.hobbies.join(" • ") : "Reading • Listening to Music • Coding");
    }

    // جلب المنشورات
    const { data: myPosts } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (myPosts && myPosts.length > 0) {
      setPosts(myPosts);
    } else {
      // منشور تجريبي مثبت مثل الصورة
      setPosts([
        {
          id: "p1",
          user_id: uid,
          content: "خليها صدقه جاريه علي بروفايلك❤️",
          visibility: "public",
          created_at: new Date().toISOString(),
          is_pinned: true,
          media_urls: ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"],
        }
      ]);
    }

    // أصدقاء تجريبيين يطابقون الصورة تماماً
    setFriends([
      { id: "f1", name: "NasrEldeen Elwazery", mutual: "1 new", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" },
      { id: "f2", name: "Abdalla Ahmed", mutual: "13 mutual friends", img: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150" },
      { id: "f3", name: "Wesam Hesham", mutual: "12 mutual friends", img: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150" },
      { id: "f4", name: "Mostafa A Khadrawy", mutual: "5 mutual friends", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150" },
    ]);

    setLoading(false);
  };

  // 🎥 رفع الصورة أو الفيديو المتحرك (بحد أقصى 5 ثواني)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = async () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 5.5) {
          alert("⚠️ عذراً، يجب ألا تزيد مدة الفيديو عن 5 ثوانٍ كصورة شخصية متحركة.");
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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    const localUrl = URL.createObjectURL(file);
    setProfile({ ...profile, cover_url: localUrl });
    await supabase.from("profiles").update({ cover_url: localUrl }).eq("id", profile.id);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || (!postText.trim() && !selectedMedia)) return;
    setIsPosting(true);
    const newP: Post = {
      id: Date.now().toString(),
      user_id: profile.id,
      content: postText.trim(),
      media_urls: selectedMedia ? [selectedMedia] : [],
      visibility: "public",
      created_at: new Date().toISOString(),
    };
    setPosts([newP, ...posts]);
    setPostText("");
    setSelectedMedia(null);
    setIsPosting(false);
  };

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
    };
    await supabase.from("profiles").update(updatePayload).eq("id", profile.id);
    setProfile({ ...profile, ...updatePayload });
    setIsSaving(false);
    setIsEditOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1877f2]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#050505] font-sans pb-20 select-none">
      
      {/* 🔹 1. الهيدر العلوي بأسلوب Facebook */}
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

          {/* زر تغيير الغلاف */}
          <button
            onClick={() => coverFileRef.current?.click()}
            className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition shadow"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

          {/* زر Share a note */}
          <button className="absolute top-3 left-3 bg-white/90 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-full shadow backdrop-blur-sm">
            Share a note...
          </button>
        </div>

        {/* الصورة الشخصية (تدعم فيديو 5 ثواني) + معلومات البروفايل */}
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
                  profile?.full_name?.charAt(0).toUpperCase() || "A"
                )}
              </div>

              {/* زر كاميرا الصورة الشخصية */}
              <button
                onClick={() => avatarFileRef.current?.click()}
                className="absolute bottom-0 right-0 bg-gray-200 hover:bg-gray-300 border-2 border-white p-1.5 rounded-full shadow text-slate-800 transition"
                title="تغيير الصورة أو فيديو متحرك 5ث"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input ref={avatarFileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* سهم القائمة المنسدلة على اليمين */}
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-slate-700 cursor-pointer">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>

          {/* الاسم والتوثيق والـ Bio */}
          <div className="mt-2.5 space-y-1 text-left">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold text-slate-900">{profile?.full_name || "Adham Sayed"}</h1>
              <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50" />
            </div>
            <p className="text-xs font-semibold text-gray-500">54 friends • {posts.length} posts</p>

            {/* البايو */}
            <p className="text-xs font-normal text-slate-800 whitespace-pre-line pt-1">
              {profile?.bio || "you can feel fog ✨\nel_fox"}
            </p>

            {/* الحالة الاجتماعية سريعة */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 pt-0.5">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>{profile?.relationship_status || "Single"}</span>
            </div>

            {/* الأصدقاء المشتركون */}
            <div className="flex items-center gap-2 pt-1 text-xs text-gray-500 font-medium">
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="w-5 h-5 rounded-full bg-gray-300 border border-white"></div>
                <div className="w-5 h-5 rounded-full bg-gray-400 border border-white"></div>
                <div className="w-5 h-5 rounded-full bg-gray-500 border border-white"></div>
              </div>
              <span className="text-[11px]">Friends with things in common</span>
            </div>

            {/* الرتبة من مميزاتنا */}
            <div className="pt-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                <Sparkles className="w-3 h-3 text-amber-500" />
                الرتبة: المطور والمؤسس 👑
              </span>
            </div>
          </div>

          {/* 🔘 أزرار Add to story & Edit profile */}
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

      {/* 🔹 3. الأقسام التفصيلية (Facebook Details) */}
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
              <span>{profile?.location || "Giza"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <HomeIcon className="w-4 h-4 text-gray-500" />
              <span>{profile?.location || "Giza"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>{profile?.birth_date || "November 8, 2005"}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-gray-500" />
              <span>{profile?.relationship_status || "Single"}</span>
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
              <p className="font-bold text-slate-900">{profile?.education || "معهد الجيزة العالي للهندسة والتكنولوجيا"}</p>
              <p className="text-[11px] text-gray-500">In September 2025</p>
            </div>
          </div>
        </div>

        {/* Hobbies */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm space-y-2.5 text-left">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
            <h3 className="font-bold text-xs text-slate-900">Hobbies</h3>
            <button onClick={() => setIsEditOpen(true)} className="text-gray-400 hover:text-slate-800">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
            <Activity className="w-4 h-4 text-gray-500" />
            <span>{editHobbies || "Reading • Listening to Music • Coding"}</span>
          </div>
        </div>

        {/* Friends */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900">Friends</h3>
            <span className="text-xs font-bold text-[#1877f2] cursor-pointer">See all</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {friends.map((friend) => (
              <div key={friend.id} className="space-y-1">
                <img src={friend.img} alt={friend.name} className="w-14 h-14 mx-auto rounded-full object-cover border border-gray-200" />
                <p className="font-bold text-[10px] text-slate-900 truncate">{friend.name}</p>
                <p className="text-[9px] text-gray-400 truncate">{friend.mutual}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm space-y-2.5">
          <h3 className="font-bold text-xs text-slate-900 text-left">Highlights</h3>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <div className="flex-shrink-0 w-20 h-32 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-gray-600">New</span>
            </div>

            {highlights.map((h) => (
              <div key={h.id} className="flex-shrink-0 w-20 h-32 rounded-xl relative overflow-hidden border border-gray-200">
                <img src={h.image} alt={h.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                  <span className="text-[9px] font-bold text-white truncate w-full text-center">{h.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All posts & What's on your mind */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900">All posts</h3>
            <span className="text-xs font-bold text-[#1877f2] cursor-pointer">Filters</span>
          </div>

          {/* صندوق كتابة منشور */}
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                A
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

          <button className="w-full bg-gray-200 hover:bg-gray-300 text-slate-800 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Manage posts</span>
          </button>
        </div>

        {/* قائمة المنشورات */}
        <div className="space-y-3 pt-1">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                    A
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{profile?.full_name || "Adham Sayed"}</h4>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                      {post.is_pinned && <span className="flex items-center gap-0.5 text-slate-700 font-bold"><Pin className="w-2.5 h-2.5" /> Pinned •</span>}
                      <span>{new Date(post.created_at).toLocaleDateString()} • 🌐</span>
                    </div>
                  </div>
                </div>

                <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
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
          ))}
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
                  <option value="Single">Single</option>
                  <option value="In a relationship">In a relationship</option>
                  <option value="Engaged">Engaged</option>
                  <option value="Married">Married</option>
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