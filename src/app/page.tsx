"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  X,
  Menu,
  Bookmark,
  History,
  Calendar,
  ChevronDown,
  ChevronUp,
  Heart,
  Gamepad2,
  Megaphone,
  Plus,
  Settings,
  LogOut,
  ChevronLeft,
  Search,
  MessageSquare,
  Image as ImageIcon,
  Smile,
  Send,
  Home,
  Film,
  Users,
  UserCheck,
  Bell,
  User,
  Share2,
  Mic,
  Square,
  Video,
  Type,
  Globe,
  Lock,
  Loader2,
  Trash2,
  BadgeCheck,
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  user_number_id: string;
  is_verified: boolean;
  rank_tier: string;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  media_url?: string | null;
  created_at: string;
  profile?: Profile;
  replies?: Comment[];
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  visibility: string;
  created_at: string;
  profile?: Profile;
  reactions?: { type: string; user_id: string }[];
  comments?: Comment[];
  myReaction?: string | null;
}

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  caption?: string;
  created_at: string;
  expires_at: string;
  profile?: Profile;
}

export default function HomePage() {
  const router = useRouter();

  // حالات التنقل والبحث
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // القوائم الجانبية
  const [openEvents, setOpenEvents] = useState(false);
  const [openFavorites, setOpenFavorites] = useState(false);
  const [openGames, setOpenGames] = useState(false);

  // المستخدم المسجل حالياً
  const [myProfile, setMyProfile] = useState<Profile | null>(null);

  // المنشورات
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postText, setPostText] = useState("");
  const [postVisibility, setPostVisibility] = useState<"public" | "friends">("public");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // القصص
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [newStoryType, setNewStoryType] = useState<"text" | "image">("text");
  const [newStoryContent, setNewStoryContent] = useState("");
  const [newStoryBgColor, setNewStoryBgColor] = useState("from-orange-500 to-amber-500");

  // التفاعلات والتعليقات
  const [activeReactionPostId, setActiveReactionPostId] = useState<string | null>(null);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentInputText, setCommentInputText] = useState<{ [postId: string]: string }>({});
  const [replyInputText, setReplyInputText] = useState<{ [commentId: string]: string }>({});
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<string | null>(null);

  // التسجيل الصوتي
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [recordingPostId, setRecordingPostId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // مؤقت عرض القصة
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeStory) {
      setStoryProgress(0);
      interval = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            setActiveStory(null);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [activeStory]);

  // جلب البيانات الأولية المتوافقة مع هيكل profiles الجديد
  const fetchInitialData = async () => {
    setLoadingPosts(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setMyProfile(profileData);
      }
    }

    // جلب القصص الصالحة
    const { data: storiesData } = await supabase
      .from("stories")
      .select("*, profile:profiles(*)")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (storiesData) setStories(storiesData);

    // جلب المنشورات والتفاعلات والتعليقات
    await fetchPosts(session?.user?.id);
    setLoadingPosts(false);
  };

  const fetchPosts = async (currentUserId?: string) => {
    const { data: postsData } = await supabase
      .from("posts")
      .select(`
        *,
        profile:profiles(*),
        reactions:post_reactions(*),
        comments:comments(*, profile:profiles(*))
      `)
      .order("created_at", { ascending: false });

    if (postsData) {
      const formatted = postsData.map((p) => {
        const myReaction = currentUserId
          ? p.reactions?.find((r: { user_id: string; type: string }) => r.user_id === currentUserId)?.type || null
          : null;
        return {
          ...p,
          myReaction,
        };
      });
      setPosts(formatted);
    }
  };

  // إنشاء منشور
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProfile || (!postText.trim() && !selectedMedia)) return;

    setIsSubmittingPost(true);

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: myProfile.id,
        content: postText.trim(),
        media_urls: selectedMedia ? [selectedMedia] : [],
        visibility: postVisibility,
      })
      .select("*, profile:profiles(*)")
      .single();

    if (!error && data) {
      setPosts([{ ...data, reactions: [], comments: [], myReaction: null }, ...posts]);
      setPostText("");
      setSelectedMedia(null);
    }

    setIsSubmittingPost(false);
  };

  // إنشاء قصة
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProfile || !newStoryContent.trim()) return;

    const { data, error } = await supabase
      .from("stories")
      .insert({
        user_id: myProfile.id,
        media_url: newStoryType === "text" ? `gradient:${newStoryBgColor}` : newStoryContent,
        caption: newStoryType === "text" ? newStoryContent : undefined,
      })
      .select("*, profile:profiles(*)")
      .single();

    if (!error && data) {
      setStories([data, ...stories]);
      setNewStoryContent("");
      setIsCreateStoryOpen(false);
    }
  };

  // التفاعل مع منشور
  const handleReact = async (postId: string, reactionType: string) => {
    if (!myProfile) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const isSame = post.myReaction === reactionType;

    // تحديث الحالة محلياً للسرعة
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          const filteredReactions = (p.reactions || []).filter((r) => r.user_id !== myProfile.id);
          const newReactions = isSame
            ? filteredReactions
            : [...filteredReactions, { type: reactionType, user_id: myProfile.id }];
          return {
            ...p,
            myReaction: isSame ? null : reactionType,
            reactions: newReactions,
          };
        }
        return p;
      })
    );
    setActiveReactionPostId(null);

    if (isSame) {
      await supabase.from("post_reactions").delete().match({ post_id: postId, user_id: myProfile.id });
    } else {
      await supabase.from("post_reactions").upsert({
        post_id: postId,
        user_id: myProfile.id,
        type: reactionType,
      });

      // إرسال إشعار لصاحب المنشور إذا لم يكن هو نفسه
      if (post.user_id !== myProfile.id) {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          actor_id: myProfile.id,
          type: "like",
          content: "تفاعل مع منشورك.",
          entity_id: postId,
        });
      }
    }
  };

  // إضافة تعليق
  const handleAddComment = async (postId: string) => {
    const text = commentInputText[postId];
    if (!myProfile || !text || !text.trim()) return;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: myProfile.id,
        content: text.trim(),
      })
      .select("*, profile:profiles(*)")
      .single();

    if (!error && data) {
      setPosts(
        posts.map((p) => (p.id === postId ? { ...p, comments: [...(p.comments || []), data] } : p))
      );
      setCommentInputText({ ...commentInputText, [postId]: "" });

      const post = posts.find((p) => p.id === postId);
      if (post && post.user_id !== myProfile.id) {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          actor_id: myProfile.id,
          type: "comment",
          content: `علق على منشورك: "${text.slice(0, 30)}..."`,
          entity_id: postId,
        });
      }
    }
  };

  // إضافة رد على تعليق
  const handleAddReply = async (postId: string, commentId: string) => {
    const text = replyInputText[commentId];
    if (!myProfile || !text || !text.trim()) return;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: myProfile.id,
        parent_id: commentId,
        content: text.trim(),
      })
      .select("*, profile:profiles(*)")
      .single();

    if (!error && data) {
      setPosts(
        posts.map((p) => (p.id === postId ? { ...p, comments: [...(p.comments || []), data] } : p))
      );
      setReplyInputText({ ...replyInputText, [commentId]: "" });
      setActiveReplyCommentId(null);
    }
  };

  // التسجيل الصوتي للتعليقات
  const startRecording = async (postId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);

        if (myProfile) {
          const { data } = await supabase
            .from("comments")
            .insert({
              post_id: postId,
              user_id: myProfile.id,
              content: "🎤 تعليق صوتي",
              media_url: audioUrl,
            })
            .select("*, profile:profiles(*)")
            .single();

          if (data) {
            setPosts(
              posts.map((p) => (p.id === postId ? { ...p, comments: [...(p.comments || []), data] } : p))
            );
          }
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingPostId(postId);
      setRecordingTimer(0);
      timerIntervalRef.current = setInterval(() => setRecordingTimer((prev) => prev + 1), 1000);
    } catch {
      alert("يرجى إعطاء صلاحية الميكروفون.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingPostId(null);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  // حذف منشور
  const handleDeletePost = async (postId: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا المنشور؟")) {
      setPosts(posts.filter((p) => p.id !== postId));
      await supabase.from("posts").delete().eq("id", postId);
    }
  };

  const handleShare = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    alert("تم نسخ رابط المنشور بنجاح!");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 dir-rtl font-sans select-none pb-20">
      {/* 🟢 الهيدر العلوي */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/messages")}
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition relative"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></span>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-black text-lg text-slate-900 tracking-wide">TTT Platform</span>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 🟢 شاشة البحث */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-start justify-center pt-16 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-4 w-full max-w-md space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن أصدقاء، منشورات، كلمات..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold focus:outline-none focus:border-orange-500"
              />
              <button onClick={() => setIsSearchOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center py-4 text-xs text-slate-500 font-bold">
              {searchQuery ? `تم العثور على (${filteredPosts.length}) نتائج` : "اكتب كلمة البحث للبدء..."}
            </div>
          </div>
        </div>
      )}

      {/* 🟢 محتوى الصفحة */}
      <main className="p-4 max-w-lg mx-auto space-y-4">
        {/* 📖 شريط القصص */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setIsCreateStoryOpen(true)}
            className="flex-shrink-0 w-24 h-36 bg-white border-2 border-dashed border-orange-300 rounded-3xl p-2 flex flex-col items-center justify-between text-center hover:bg-orange-50/50 transition shadow-sm group"
          >
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-lg mt-2 shadow-md shadow-orange-500/20 group-hover:scale-110 transition">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black text-slate-800 pb-1">قصة جديدة</span>
          </button>

          {stories.map((story) => {
            const isGradient = story.media_url?.startsWith("gradient:");
            const gradientClass = isGradient ? story.media_url.replace("gradient:", "bg-gradient-to-tr ") : "bg-slate-900";

            return (
              <div
                key={story.id}
                onClick={() => setActiveStory(story)}
                className={`flex-shrink-0 w-24 h-36 rounded-3xl p-2 flex flex-col justify-between cursor-pointer border-2 border-orange-500 shadow-sm relative overflow-hidden transition transform hover:scale-105 ${gradientClass}`}
              >
                <div className="w-8 h-8 rounded-full bg-white text-orange-600 flex items-center justify-center font-black text-xs border border-orange-500">
                  {story.profile?.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <p className="text-[10px] font-bold line-clamp-2 text-right dir-rtl leading-tight text-white">
                  {story.caption || "عرض القصة"}
                </p>
                <span className="text-[9px] font-bold text-orange-200 text-right truncate">
                  {story.profile?.full_name || "مستخدم"}
                </span>
              </div>
            );
          })}
        </div>

        {/* ✏️ صندوق النشر */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm border-2 border-orange-500 shadow-sm">
                {myProfile?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="font-black text-xs text-slate-900">{myProfile?.full_name || "جاري التحميل..."}</h4>
                  {myProfile?.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
                </div>
                <span className="text-[10px] font-bold text-slate-400 dir-ltr block">
                  #{myProfile?.user_number_id || "00000000"}
                </span>
              </div>
            </div>

            <select
              value={postVisibility}
              onChange={(e) => setPostVisibility(e.target.value as "public" | "friends")}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-[10px] font-bold text-slate-700 focus:outline-none focus:border-orange-500"
            >
              <option value="public">🌐 عام</option>
              <option value="friends">👥 الأصدقاء فقط</option>
            </select>
          </div>

          <textarea
            rows={2}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder={`بم تفكر يا ${myProfile?.full_name?.split(" ")[0] || "مستخدم"}؟`}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition resize-none font-medium text-slate-800 placeholder:text-slate-400"
          />

          {selectedMedia && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-48">
              <img src={selectedMedia} alt="Media" className="w-full object-cover max-h-48" />
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-2 left-2 bg-slate-900/70 text-white p-1.5 rounded-full hover:bg-slate-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleCreatePost}
              disabled={(!postText.trim() && !selectedMedia) || isSubmittingPost}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold px-5 py-2 rounded-2xl text-xs flex items-center gap-1.5 transition shadow-sm shadow-orange-500/20"
            >
              {isSubmittingPost ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 rotate-180" />}
              <span>نشر</span>
            </button>

            <div className="flex items-center gap-1.5">
              <label className="cursor-pointer flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-2xl transition">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>وسائط</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedMedia(URL.createObjectURL(file));
                  }}
                />
              </label>

              <button className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-2xl transition">
                <Smile className="w-3.5 h-3.5 text-slate-500" />
                <span>شعور</span>
              </button>
            </div>
          </div>
        </div>

        {/* 📰 عرض المنشورات */}
        {loadingPosts ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center flex justify-center items-center gap-2 shadow-sm">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            <span className="text-xs font-bold text-slate-500">جاري تحميل المنشورات...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-400">لا توجد منشورات حتى الآن، كن أول من ينشر!</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const reactionIcons: { [key: string]: string } = {
              like: "👍",
              love: "❤️",
              haha: "😆",
              wow: "😮",
              sad: "😢",
              angry: "😡",
            };

            return (
              <div key={post.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm border-2 border-orange-500">
                      {post.profile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="font-black text-xs text-slate-900">{post.profile?.full_name || "مستخدم"}</h4>
                        {post.profile?.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <span>{new Date(post.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
                        <span>•</span>
                        <span>{post.visibility === "public" ? <Globe className="w-3 h-3 inline" /> : <Lock className="w-3 h-3 inline" />}</span>
                      </div>
                    </div>
                  </div>

                  {post.user_id === myProfile?.id && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                      title="حذف المنشور"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-medium text-right">{post.content}</p>

                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="rounded-2xl overflow-hidden border border-slate-100">
                    <img src={post.media_urls[0]} alt="Attachment" className="w-full object-cover max-h-80" />
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-t border-b border-slate-50 py-2">
                  <span>{(post.reactions || []).length > 0 ? `${post.reactions?.length} تفاعلات` : "لا توجد تفاعلات"}</span>
                  <div className="flex gap-2">
                    <span>{(post.comments || []).length} تعليق</span>
                  </div>
                </div>

                {/* أزرار التفاعل */}
                <div className="relative flex items-center justify-around text-xs font-bold text-slate-600 pt-1">
                  <div className="relative">
                    <button
                      onClick={() => handleReact(post.id, "like")}
                      onMouseEnter={() => setActiveReactionPostId(post.id)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl transition ${
                        post.myReaction ? "text-orange-600 font-black" : "hover:bg-slate-50"
                      }`}
                    >
                      <span>{post.myReaction ? reactionIcons[post.myReaction] : "👍"}</span>
                      <span>{post.myReaction ? "تفاعلت" : "إعجاب"}</span>
                    </button>

                    {activeReactionPostId === post.id && (
                      <div
                        onMouseLeave={() => setActiveReactionPostId(null)}
                        className="absolute bottom-full right-0 mb-2 bg-white border border-orange-100 rounded-full p-1.5 shadow-2xl flex gap-2 z-40 animate-in fade-in zoom-in duration-150"
                      >
                        {Object.entries(reactionIcons).map(([key, emoji]) => (
                          <button
                            key={key}
                            onClick={() => handleReact(post.id, key)}
                            className="hover:scale-125 transition text-lg p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setExpandedCommentsPostId(expandedCommentsPostId === post.id ? null : post.id)
                    }
                    className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <span>تعليق</span>
                  </button>

                  <button onClick={() => handleShare(post.id)} className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition">
                    <Share2 className="w-4 h-4 text-slate-500" />
                    <span>مشاركة</span>
                  </button>
                </div>

                {/* قسم التعليقات */}
                {expandedCommentsPostId === post.id && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInputText[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputText({ ...commentInputText, [post.id]: e.target.value })
                        }
                        placeholder="اكتب تعليقاً..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                      />

                      <button
                        onClick={() =>
                          isRecording && recordingPostId === post.id ? stopRecording() : startRecording(post.id)
                        }
                        className={`p-2.5 rounded-2xl transition border flex items-center gap-1 ${
                          isRecording && recordingPostId === post.id
                            ? "bg-red-500 text-white border-red-500 animate-pulse"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-orange-50"
                        }`}
                      >
                        {isRecording && recordingPostId === post.id ? (
                          <>
                            <Square className="w-4 h-4" />
                            <span className="text-[10px] font-bold">{recordingTimer}s</span>
                          </>
                        ) : (
                          <Mic className="w-4 h-4 text-orange-500" />
                        )}
                      </button>

                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="bg-orange-500 text-white p-2.5 rounded-2xl hover:bg-orange-600 transition"
                      >
                        <Send className="w-4 h-4 rotate-180" />
                      </button>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {(post.comments || [])
                        .filter((c) => !c.parent_id)
                        .map((comment) => (
                          <div key={comment.id} className="bg-slate-50 p-2.5 rounded-2xl space-y-2 text-right">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-[10px]">
                                  {comment.profile?.full_name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <span className="font-black text-xs text-slate-900">{comment.profile?.full_name || "مستخدم"}</span>
                              </div>
                              <span className="text-[9px] font-bold text-slate-400">
                                {new Date(comment.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-slate-700 pr-9">{comment.content}</p>
                            {comment.media_url && (
                              <div className="pr-9 pt-1">
                                <audio src={comment.media_url} controls className="w-full max-w-xs h-8" />
                              </div>
                            )}

                            <div className="pr-9 flex gap-3 text-[10px] font-bold text-slate-400">
                              <button
                                onClick={() =>
                                  setActiveReplyCommentId(activeReplyCommentId === comment.id ? null : comment.id)
                                }
                                className="hover:text-orange-600 font-bold"
                              >
                                رد
                              </button>
                            </div>

                            {activeReplyCommentId === comment.id && (
                              <div className="pr-9 pt-1 flex gap-2">
                                <input
                                  type="text"
                                  value={replyInputText[comment.id] || ""}
                                  onChange={(e) =>
                                    setReplyInputText({ ...replyInputText, [comment.id]: e.target.value })
                                  }
                                  placeholder="اكتب رداً..."
                                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold focus:outline-none focus:border-orange-500"
                                />
                                <button
                                  onClick={() => handleAddReply(post.id, comment.id)}
                                  className="bg-orange-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold"
                                >
                                  رد
                                </button>
                              </div>
                            )}

                            {/* عرض الردود */}
                            {(post.comments || [])
                              .filter((r) => r.parent_id === comment.id)
                              .map((reply) => (
                                <div key={reply.id} className="mr-8 mt-1.5 bg-white p-2 rounded-xl border border-slate-100 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-[11px] text-slate-800">{reply.profile?.full_name || "مستخدم"}</span>
                                    <span className="text-[8px] text-slate-400 font-bold">
                                      {new Date(reply.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 font-bold">{reply.content}</p>
                                </div>
                              ))}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>

      {/* 📖 مشغل القصة */}
      {activeStory && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in zoom-in duration-150">
          <div className="relative w-full max-w-sm h-[75vh] rounded-3xl bg-slate-900 text-white p-6 flex flex-col justify-between shadow-2xl overflow-hidden border border-slate-800">
            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mb-2">
              <div className="bg-orange-500 h-full transition-all ease-linear" style={{ width: `${storyProgress}%` }}></div>
            </div>

            <button onClick={() => setActiveStory(null)} className="absolute top-6 left-6 bg-white/20 p-2 rounded-full hover:bg-white/40 transition z-10">
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-sm">
                {activeStory.profile?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="text-right">
                <h4 className="font-black text-sm">{activeStory.profile?.full_name || "مستخدم"}</h4>
                <span className="text-[10px] text-orange-300 font-bold">
                  {new Date(activeStory.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            <div className="my-auto text-center p-4">
              <p className="text-lg font-black leading-relaxed">{activeStory.caption || ""}</p>
            </div>

            <div className="text-center text-xs text-slate-400 font-bold">TTT Stories Platform</div>
          </div>
        </div>
      )}

      {/* ➕ شاشة إنشاء قصة */}
      {isCreateStoryOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900">إنشاء قصة جديدة</h3>
              <button onClick={() => setIsCreateStoryOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setNewStoryType("text")}
                className={`p-2 rounded-xl border flex items-center justify-center gap-1 transition ${
                  newStoryType === "text" ? "bg-orange-500 text-white border-orange-500" : "bg-slate-50 text-slate-700"
                }`}
              >
                <Type className="w-4 h-4" />
                <span>نص</span>
              </button>
              <button
                type="button"
                onClick={() => setNewStoryType("image")}
                className={`p-2 rounded-xl border flex items-center justify-center gap-1 transition ${
                  newStoryType === "image" ? "bg-orange-500 text-white border-orange-500" : "bg-slate-50 text-slate-700"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>صورة</span>
              </button>
            </div>

            {newStoryType === "text" && (
              <div className="flex justify-around py-1">
                {[
                  "from-orange-500 to-amber-500",
                  "from-purple-600 to-pink-500",
                  "from-blue-600 to-cyan-500",
                  "from-emerald-500 to-teal-700",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewStoryBgColor(color)}
                    className={`w-7 h-7 rounded-full bg-gradient-to-tr ${color} border-2 ${
                      newStoryBgColor === color ? "border-slate-900 scale-110" : "border-transparent"
                    }`}
                  />
                ))}
              </div>
            )}

            <textarea
              rows={4}
              value={newStoryContent}
              onChange={(e) => setNewStoryContent(e.target.value)}
              placeholder="اكتب نص القصة هنا..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold focus:outline-none focus:border-orange-500"
            />

            <button
              onClick={handleCreateStory}
              disabled={!newStoryContent.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md shadow-orange-500/20"
            >
              نشر القصة
            </button>
          </div>
        </div>
      )}

      {/* 🔴 خلفية السايد بار */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" />
      )}

      {/* 🔴 القائمة الجانبية */}
      <aside
        className={`fixed top-0 right-0 h-full w-[85%] max-w-xs bg-white z-50 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-80px)] no-scrollbar">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-left dir-ltr">
              <div className="w-8 h-8 relative">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 leading-none">TTT Platform</h3>
                <span className="text-[9px] font-bold text-orange-500">أحد منصات Beta</span>
              </div>
            </div>
          </div>

          <Link
            href="/profile"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center justify-between bg-slate-50 hover:bg-orange-50/50 p-3 rounded-2xl border border-slate-100 hover:border-orange-200 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-base border-2 border-orange-500 shadow-sm">
                {myProfile?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <h4 className="font-black text-xs text-slate-900 group-hover:text-orange-600 transition">
                    {myProfile?.full_name || "مستخدم"}
                  </h4>
                  {myProfile?.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
                </div>
                <span className="text-[10px] font-bold text-slate-400 dir-ltr block">
                  #{myProfile?.user_number_id || "00000000"}
                </span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition" />
          </Link>

          <div className="space-y-1 pt-1">
            <Link
              href="/saved"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-2xl text-slate-700 hover:bg-slate-50 hover:text-orange-600 font-bold text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-orange-500" />
                <span>المحفوظات</span>
              </div>
            </Link>

            <Link
              href="/memories"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-2xl text-slate-700 hover:bg-slate-50 hover:text-orange-600 font-bold text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-orange-500" />
                <span>الذكريات</span>
              </div>
            </Link>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-1">
            <button
              onClick={() => setOpenEvents(!openEvents)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>الأحداث</span>
              </div>
              {openEvents ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {openEvents && (
              <div className="pr-7 space-y-1.5 pt-1 text-[11px] font-bold text-slate-500">
                <Link href="/events/birthdays" className="block p-1.5 hover:text-orange-600 transition">🎉 أعياد الميلاد</Link>
                <Link href="/events/engagements" className="block p-1.5 hover:text-orange-600 transition">💍 خطوبة وزواج</Link>
                <Link href="/events/special" className="block p-1.5 hover:text-orange-600 transition">✨ مناسبات خاصة</Link>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setOpenFavorites(!openFavorites)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-orange-500" />
                <span>الأشخاص المفضلة</span>
              </div>
              {openFavorites ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setOpenGames(!openGames)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <Gamepad2 className="w-4 h-4 text-orange-500" />
                <span>الألعاب</span>
              </div>
              {openGames ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-xs text-slate-800">مركز الإعلانات</span>
              </div>
              <button className="bg-orange-50 hover:bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-1 rounded-xl flex items-center gap-0.5 border border-orange-200 transition">
                <Plus className="w-3 h-3" />
                <span>أضف إعلانك</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-1">
          <Link
            href="/settings"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-2.5 p-2.5 rounded-2xl text-slate-700 hover:bg-white font-bold text-xs transition"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>الإعدادات والخصوصية</span>
          </Link>

          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-red-600 hover:bg-red-50 font-bold text-xs transition">
            <LogOut className="w-4 h-4 text-red-500" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </div>
  );
}