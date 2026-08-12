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
  ThumbsUp,
  Mic,
  Square,
  Volume2,
  MoreHorizontal,
  Video,
  Type,
  Globe,
  Lock,
} from "lucide-react";

// واجهات البيانات
interface CommentReply {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content?: string;
  audioUrl?: string;
  createdAt: string;
  replies: CommentReply[];
}

interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  privacy: "public" | "friends";
  createdAt: string;
  reaction: string | null;
  reactionsCount: number;
  comments: Comment[];
  sharesCount: number;
}

interface Story {
  id: string;
  authorName: string;
  authorAvatar: string;
  type: "text" | "image" | "video";
  content: string;
  bgColor?: string;
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();

  // 1️⃣ حالات القائمة الجانبية والبحث
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 2️⃣ حالات القوائم المنسدلة في السايد بار
  const [openEvents, setOpenEvents] = useState(false);
  const [openFavorites, setOpenFavorites] = useState(false);
  const [openGames, setOpenGames] = useState(false);

  // 3️⃣ بيانات المستخدم الحالي الحقيقية من Supabase
  const [userData, setUserData] = useState({
    id: "",
    fullName: "جاري التحميل...",
    firstName: "المستخدم",
    idNumber: "#000000",
    avatarChar: "U",
  });

  // 4️⃣ حالات المنشورات والقصص
  const [posts, setPosts] = useState<Post[]>([]);
  const [postText, setPostText] = useState("");
  const [postPrivacy, setPostPrivacy] = useState<"public" | "friends">("public");
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: "image" | "video" } | null>(null);

  // 5️⃣ حالات القصص (Stories)
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [newStoryType, setNewStoryType] = useState<"text" | "image" | "video">("text");
  const [newStoryContent, setNewStoryContent] = useState("");

  // 6️⃣ حالات التفاعلات والتعليقات الصوتية
  const [activeReactionPostId, setActiveReactionPostId] = useState<string | null>(null);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentInputText, setCommentInputText] = useState<{ [postId: string]: string }>({});
  const [replyInputText, setReplyInputText] = useState<{ [commentId: string]: string }>({});
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<string | null>(null);

  // تسجيل الصوت للتعليق
  const [isRecording, setIsRecording] = useState(false);
  const [recordingPostId, setRecordingPostId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 🔄 جلب بيانات المستخدم الحقيقي والتجهيز الأول
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const meta = session.user.user_metadata;
        const name = meta?.full_name || meta?.first_name || session.user.email?.split("@")[0] || "مستخدم TTT";
        const fName = meta?.first_name || name.split(" ")[0] || "مستخدم";
        const shortId = `#${session.user.id.slice(0, 8)}`;
        const firstLetter = name.charAt(0).toUpperCase();

        setUserData({
          id: session.user.id,
          fullName: name,
          firstName: fName,
          idNumber: shortId,
          avatarChar: firstLetter,
        });
      }
    };

    fetchUserData();
  }, []);

  // 🎙️ بدء وتسجيل تعليق صوتي
  const startRecording = async (postId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // إضافة التعليق الصوتي للمنشور
        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p.id === postId) {
              const newComment: Comment = {
                id: Date.now().toString(),
                authorName: userData.fullName,
                authorAvatar: userData.avatarChar,
                audioUrl: audioUrl,
                createdAt: "الآن",
                replies: [],
              };
              return { ...p, comments: [...p.comments, newComment] };
            }
            return p;
          })
        );
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingPostId(postId);
    } catch {
      alert("يرجى إعطاء صلاحية الميكروفون لتسجيل التعليق الصوتي.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingPostId(null);
    }
  };

  // 📝 نشر منشور جديد
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && !selectedMedia) return;

    const newPost: Post = {
      id: Date.now().toString(),
      authorName: userData.fullName,
      authorAvatar: userData.avatarChar,
      authorId: userData.id,
      content: postText,
      mediaUrl: selectedMedia?.url,
      mediaType: selectedMedia?.type,
      privacy: postPrivacy,
      createdAt: "الآن",
      reaction: null,
      reactionsCount: 0,
      comments: [],
      sharesCount: 0,
    };

    setPosts([newPost, ...posts]);
    setPostText("");
    setSelectedMedia(null);
  };

  // 📖 إضافة قصة جديدة
  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryContent.trim()) return;

    const newStory: Story = {
      id: Date.now().toString(),
      authorName: userData.fullName,
      authorAvatar: userData.avatarChar,
      type: newStoryType,
      content: newStoryContent,
      bgColor: newStoryType === "text" ? "bg-gradient-to-tr from-orange-500 to-amber-500" : undefined,
      createdAt: "الآن",
    };

    setStories([newStory, ...stories]);
    setNewStoryContent("");
    setIsCreateStoryOpen(false);
  };

  // 👍 إضافة تفاعل للمنشور
  const handleReact = (postId: string, reactionEmoji: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          const isSame = p.reaction === reactionEmoji;
          return {
            ...p,
            reaction: isSame ? null : reactionEmoji,
            reactionsCount: isSame ? p.reactionsCount - 1 : p.reaction ? p.reactionsCount : p.reactionsCount + 1,
          };
        }
        return p;
      })
    );
    setActiveReactionPostId(null);
  };

  // 💬 إضافة تعليق نصي
  const handleAddComment = (postId: string) => {
    const text = commentInputText[postId];
    if (!text || !text.trim()) return;

    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          const newComment: Comment = {
            id: Date.now().toString(),
            authorName: userData.fullName,
            authorAvatar: userData.avatarChar,
            content: text,
            createdAt: "الآن",
            replies: [],
          };
          return { ...p, comments: [...p.comments, newComment] };
        }
        return p;
      })
    );

    setCommentInputText({ ...commentInputText, [postId]: "" });
  };

  // ↩️ إضافة رد على تعليق
  const handleAddReply = (postId: string, commentId: string) => {
    const text = replyInputText[commentId];
    if (!text || !text.trim()) return;

    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          const updatedComments = p.comments.map((c) => {
            if (c.id === commentId) {
              const newReply: CommentReply = {
                id: Date.now().toString(),
                authorName: userData.fullName,
                authorAvatar: userData.avatarChar,
                content: text,
                createdAt: "الآن",
              };
              return { ...c, replies: [...c.replies, newReply] };
            }
            return c;
          });
          return { ...p, comments: updatedComments };
        }
        return p;
      })
    );

    setReplyInputText({ ...replyInputText, [commentId]: "" });
    setActiveReplyCommentId(null);
  };

  // 🔄 مشاركة المنشور
  const handleShare = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p))
    );
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    alert("تم نسخ رابط المنشور لسبورة اللصق بنجاح!");
  };

  // 🚪 تسجيل الخروج
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 dir-rtl font-sans select-none pb-20">
      
      {/* 🟢 1. الهيدر العلوي والتنقل */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/messages")}
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition relative"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></span>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-black text-lg text-slate-900 tracking-wide">TTT Platform</span>
          
          {/* زر السايد بار تفتح في اتجاه اليمين الصحيح */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 🟢 2. شاشة البحث المنبثقة */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-start justify-center pt-16 p-4">
          <div className="bg-white rounded-3xl p-4 w-full max-w-md space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن أصدقاء، منشورات، مجموعات..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-orange-500 font-bold"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center py-6 text-xs text-slate-400 font-bold">
              {searchQuery ? `نتائج البحث عن: "${searchQuery}"` : "اكتب كلمة البحث للبدء..."}
            </div>
          </div>
        </div>
      )}

      {/* 🟢 3. محتوى الصفحة الرئيسية */}
      <main className="p-4 max-w-lg mx-auto space-y-4">

        {/* 📖 شريط القصص (Stories Bar) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          
          {/* زر إضافة قصة جديدة */}
          <button
            onClick={() => setIsCreateStoryOpen(true)}
            className="flex-shrink-0 w-24 h-36 bg-white border-2 border-dashed border-orange-300 rounded-3xl p-2 flex flex-col items-center justify-between text-center hover:bg-orange-50/50 transition shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-lg mt-2 shadow-md shadow-orange-500/20">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black text-slate-800 pb-1">قصة جديدة</span>
          </button>

          {/* قائمة القصص المضافة */}
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => setActiveStory(story)}
              className={`flex-shrink-0 w-24 h-36 rounded-3xl p-2 flex flex-col justify-between cursor-pointer border-2 border-orange-500 shadow-sm relative overflow-hidden transition transform hover:scale-105 ${
                story.bgColor || "bg-slate-900 text-white"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white text-orange-600 flex items-center justify-center font-black text-xs border border-orange-500">
                {story.authorAvatar}
              </div>
              <p className="text-[10px] font-bold line-clamp-2 text-right dir-rtl leading-tight text-white">
                {story.content}
              </p>
              <span className="text-[9px] font-bold text-orange-200 text-right">{story.authorName}</span>
            </div>
          ))}

        </div>

        {/* ✏️ صندوق إنشاء منشور جديد */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm border-2 border-orange-500">
                {userData.avatarChar}
              </div>
              <div>
                <h4 className="font-black text-xs text-slate-900">{userData.fullName}</h4>
                <span className="text-[10px] font-bold text-slate-400 dir-ltr block">{userData.idNumber}</span>
              </div>
            </div>

            {/* تحديد الخصوصية */}
            <select
              value={postPrivacy}
              onChange={(e) => setPostPrivacy(e.target.value as "public" | "friends")}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-[10px] font-bold text-slate-700 focus:outline-none focus:border-orange-500"
            >
              <option value="public">🌐 عام</option>
              <option value="friends">👥 الأصدقاء فقط</option>
            </select>
          </div>

          <textarea
            rows={2}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder={`بم تفكر يا ${userData.firstName}؟`}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition resize-none font-medium text-slate-800 placeholder:text-slate-400"
          />

          {/* المعاينة إن وجدت وسائط */}
          {selectedMedia && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-48">
              {selectedMedia.type === "image" ? (
                <img src={selectedMedia.url} alt="Uploaded Media" className="w-full object-cover max-h-48" />
              ) : (
                <video src={selectedMedia.url} controls className="w-full max-h-48" />
              )}
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-2 left-2 bg-slate-900/70 text-white p-1 rounded-full hover:bg-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* أزرار الإضافة والتفاعل */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleCreatePost}
              disabled={!postText.trim() && !selectedMedia}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold px-5 py-2 rounded-2xl text-xs flex items-center gap-1.5 transition shadow-sm shadow-orange-500/20"
            >
              <Send className="w-3.5 h-3.5 rotate-180" />
              <span>نشر</span>
            </button>

            <div className="flex items-center gap-1.5">
              {/* رفع صورة/فيديو */}
              <label className="cursor-pointer flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-2xl transition">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>وسائط</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      const type = file.type.startsWith("video") ? "video" : "image";
                      setSelectedMedia({ url, type });
                    }
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

        {/* 📰 قائمة المنشورات (Feed Posts) */}
        {posts.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-400">لا توجد منشورات حتى الآن، كن أول من ينشر!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-3">
              
              {/* هيدر كرت المنشور */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm border-2 border-orange-500">
                    {post.authorAvatar}
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-900">{post.authorName}</h4>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                      <span>{post.createdAt}</span>
                      <span>•</span>
                      <span>{post.privacy === "public" ? <Globe className="w-3 h-3 inline" /> : <Lock className="w-3 h-3 inline" />}</span>
                    </div>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* نص المنشور */}
              <p className="text-xs text-slate-800 leading-relaxed font-medium text-right">{post.content}</p>

              {/* وسائط المنشور */}
              {post.mediaUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-100">
                  {post.mediaType === "image" ? (
                    <img src={post.mediaUrl} alt="Post Attachment" className="w-full object-cover max-h-80" />
                  ) : (
                    <video src={post.mediaUrl} controls className="w-full max-h-80" />
                  )}
                </div>
              )}

              {/* إحصائيات التفاعل */}
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-t border-b border-slate-50 py-2">
                <span>{post.reactionsCount > 0 ? `${post.reactionsCount} تفاعلات` : "لا توجد تفاعلات"}</span>
                <div className="flex gap-2">
                  <span>{post.comments.length} تعليق</span>
                  <span>•</span>
                  <span>{post.sharesCount} مشاركة</span>
                </div>
              </div>

              {/* أزرار التفاعل الرئيسية مع قائمة التفاعلات المنبثقة */}
              <div className="relative flex items-center justify-around text-xs font-bold text-slate-600 pt-1">
                
                {/* 1️⃣ زر التفاعل + التفاعلات المنبثقة Popover */}
                <div className="relative">
                  <button
                    onClick={() => handleReact(post.id, "👍")}
                    onMouseEnter={() => setActiveReactionPostId(post.id)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl transition ${
                      post.reaction ? "text-orange-600 font-black" : "hover:bg-slate-50"
                    }`}
                  >
                    <span>{post.reaction || "👍"}</span>
                    <span>{post.reaction ? "تفاعلت" : "إعجاب"}</span>
                  </button>

                  {/* قائمة التفاعلات المنبثقة (Reactions Popover) */}
                  {activeReactionPostId === post.id && (
                    <div
                      onMouseLeave={() => setActiveReactionPostId(null)}
                      className="absolute bottom-full right-0 mb-2 bg-white border border-orange-100 rounded-full p-1.5 shadow-2xl flex gap-2 z-40 animate-in fade-in zoom-in duration-150"
                    >
                      {["👍", "❤️", "😆", "😮", "😢", "😡"].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReact(post.id, emoji)}
                          className="hover:scale-125 transition text-lg p-1"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2️⃣ زر فتح التعليقات */}
                <button
                  onClick={() =>
                    setExpandedCommentsPostId(expandedCommentsPostId === post.id ? null : post.id)
                  }
                  className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition"
                >
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  <span>تعليق</span>
                </button>

                {/* 3️⃣ زر المشاركة */}
                <button
                  onClick={() => handleShare(post.id)}
                  className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-slate-50 transition"
                >
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>مشاركة</span>
                </button>
              </div>

              {/* 💬 قسم التعليقات الممتد (التعليقات الصوتية والنصية) */}
              {expandedCommentsPostId === post.id && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  
                  {/* صندوق إضافة تعليق (نصي أو صوتي) */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={commentInputText[post.id] || ""}
                      onChange={(e) => setCommentInputText({ ...commentInputText, [post.id]: e.target.value })}
                      placeholder="اكتب تعليقاً..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs font-bold focus:outline-none focus:border-orange-500"
                    />

                    {/* زر التسجيل الصوتي */}
                    <button
                      onClick={() => (isRecording && recordingPostId === post.id ? stopRecording() : startRecording(post.id))}
                      className={`p-2.5 rounded-2xl transition border ${
                        isRecording && recordingPostId === post.id
                          ? "bg-red-500 text-white border-red-500 animate-pulse"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-orange-50"
                      }`}
                    >
                      {isRecording && recordingPostId === post.id ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4 text-orange-500" />}
                    </button>

                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="bg-orange-500 text-white p-2.5 rounded-2xl hover:bg-orange-600 transition"
                    >
                      <Send className="w-4 h-4 rotate-180" />
                    </button>
                  </div>

                  {/* عرض قائمة التعليقات والردود عليها */}
                  <div className="space-y-2.5 pt-1">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="bg-slate-50 p-2.5 rounded-2xl space-y-2 text-right">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-[10px]">
                              {comment.authorAvatar}
                            </div>
                            <span className="font-black text-xs text-slate-900">{comment.authorName}</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400">{comment.createdAt}</span>
                        </div>

                        {/* محتوى التعليق نصي أو صوتي */}
                        {comment.content && <p className="text-xs font-bold text-slate-700 pr-9">{comment.content}</p>}
                        {comment.audioUrl && (
                          <div className="pr-9 pt-1">
                            <audio src={comment.audioUrl} controls className="w-full max-w-xs h-8" />
                          </div>
                        )}

                        {/* زر الرد */}
                        <div className="pr-9 flex gap-3 text-[10px] font-bold text-slate-400">
                          <button
                            onClick={() =>
                              setActiveReplyCommentId(activeReplyCommentId === comment.id ? null : comment.id)
                            }
                            className="hover:text-orange-600"
                          >
                            رد
                          </button>
                        </div>

                        {/* صندوق الرد الفرعي */}
                        {activeReplyCommentId === comment.id && (
                          <div className="pr-9 pt-1 flex gap-2">
                            <input
                              type="text"
                              value={replyInputText[comment.id] || ""}
                              onChange={(e) => setReplyInputText({ ...replyInputText, [comment.id]: e.target.value })}
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

                        {/* عرض الردود الفرعية */}
                        {comment.replies.length > 0 && (
                          <div className="pr-9 pt-1 space-y-1.5">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="bg-white p-2 rounded-xl space-y-1 border border-slate-100">
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-[11px] text-slate-800">{reply.authorName}</span>
                                  <span className="text-[8px] text-slate-400 font-bold">{reply.createdAt}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 font-bold">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>
          ))
        )}

      </main>

      {/* 📖 4. شاشة عرض القصة النشطة (Story Viewer Modal) */}
      {activeStory && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-[75vh] rounded-3xl bg-slate-900 text-white p-6 flex flex-col justify-between shadow-2xl overflow-hidden border border-slate-800">
            <button
              onClick={() => setActiveStory(null)}
              className="absolute top-4 left-4 bg-white/20 p-2 rounded-full hover:bg-white/40 transition z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-sm">
                {activeStory.authorAvatar}
              </div>
              <div className="text-right">
                <h4 className="font-black text-sm">{activeStory.authorName}</h4>
                <span className="text-[10px] text-orange-300 font-bold">{activeStory.createdAt}</span>
              </div>
            </div>

            <div className="my-auto text-center p-4">
              <p className="text-lg font-black leading-relaxed">{activeStory.content}</p>
            </div>

            <div className="text-center text-xs text-slate-400 font-bold">TTT Stories Platform</div>
          </div>
        </div>
      )}

      {/* ➕ 5. شاشة إنشاء قصة جديدة (Create Story Modal) */}
      {isCreateStoryOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-sm text-slate-900">إنشاء قصة جديدة</h3>
              <button onClick={() => setIsCreateStoryOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* اختيارات نوع القصة */}
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
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
              <button
                type="button"
                onClick={() => setNewStoryType("video")}
                className={`p-2 rounded-xl border flex items-center justify-center gap-1 transition ${
                  newStoryType === "video" ? "bg-orange-500 text-white border-orange-500" : "bg-slate-50 text-slate-700"
                }`}
              >
                <Video className="w-4 h-4" />
                <span>فيديو</span>
              </button>
            </div>

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

      {/* 🔴 6. خلفية تعتيم الشاشة عند فتح السايد بار */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* 🔴 7. القائمة الجانبية (Sidebar Drawer) تفتح من اتجاه اليمين الصحيح */}
      <aside
        className={`fixed top-0 right-0 h-full w-[85%] max-w-xs bg-white z-50 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-80px)] no-scrollbar">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
            >
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
                {userData.avatarChar}
              </div>
              <div className="text-right">
                <h4 className="font-black text-xs text-slate-900 group-hover:text-orange-600 transition">
                  {userData.fullName}
                </h4>
                <span className="text-[10px] font-bold text-slate-400 dir-ltr block">{userData.idNumber}</span>
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

          {/* الأحداث */}
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

          {/* الأشخاص المفضلة */}
          <div className="space-y-1">
            <button
              onClick={() => setOpenFavorites(!openFavorites)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-orange-500" />
                <span>الأشخاص المفضلة <span className="text-[9px] text-slate-400 font-normal">(حد أقصى 5)</span></span>
              </div>
              {openFavorites ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {openFavorites && (
              <div className="pr-7 space-y-2 pt-1.5 text-xs font-bold text-slate-500">
                <p className="text-[10px] text-slate-400">لا يوجد أشخاص مفضلة مضافة بعد</p>
              </div>
            )}
          </div>

          {/* الألعاب */}
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

            {openGames && (
              <div className="pr-7 space-y-1.5 pt-1 text-[11px] font-bold text-slate-500">
                <Link href="/games/popular" className="block p-1.5 hover:text-orange-600 transition">🎮 الألعاب الأكثر شائعة</Link>
                <Link href="/games/challenge" className="block p-1.5 hover:text-orange-600 transition">🏆 التحديات الأسبوعية</Link>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* مركز الإعلانات */}
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

            <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white p-3.5 rounded-2xl shadow-sm space-y-1.5 text-right relative overflow-hidden">
              <div className="text-[10px] font-black bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full inline-block">
                إعلان مميز 🚀
              </div>
              <h5 className="font-black text-xs">احصل على خصم 50% على خدماتنا!</h5>
              <p className="text-[10px] text-orange-100 font-medium">سجل الآن واستمتع بجميع المميزات الفاخرة.</p>
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

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-red-600 hover:bg-red-50 font-bold text-xs transition"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* 🟢 8. شريط التنقل السفلي */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-2 px-3 flex justify-around items-center z-30 shadow-lg">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-orange-600 font-bold text-[10px]">
          <Home className="w-5 h-5" />
          <span>الرئيسية</span>
        </Link>
        <Link href="/reels" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 font-bold text-[10px] transition">
          <Film className="w-5 h-5" />
          <span>الريلز</span>
        </Link>
        <Link href="/friends" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 font-bold text-[10px] transition">
          <UserCheck className="w-5 h-5" />
          <span>الأصدقاء</span>
        </Link>
        <Link href="/groups" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 font-bold text-[10px] transition">
          <Users className="w-5 h-5" />
          <span>المجموعات</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 font-bold text-[10px] transition">
          <Bell className="w-5 h-5" />
          <span>الإشعارات</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 font-bold text-[10px] transition">
          <User className="w-5 h-5" />
          <span>حسابي</span>
        </Link>
      </nav>

    </div>
  );
}