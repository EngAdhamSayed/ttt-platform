"use client";

import React, { useState, useEffect } from "react";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Image as ImageIcon, 
  Send, 
  Loader2, 
  Bookmark,
  Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Post {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // جلب المنشورات عند تحميل الصفحة
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        image_url,
        created_at,
        user_id
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data as Post[]);
    }
    setLoading(false);
  };

  // نشر منشور جديد
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("يرجى تسجيل الدخول أولاً لنشر منشور جديد!");
      setPosting(false);
      return;
    }

    const { error } = await supabase.from("posts").insert([
      {
        user_id: user.id,
        content: newPostContent.trim(),
      },
    ]);

    if (error) {
      alert("حدث خطأ أثناء نشر المشاركة، يرجى المحاولة لاحقاً.");
    } else {
      setNewPostContent("");
      fetchPosts(); // إعادة جلب البوستات لتحديث القائمة
    }
    setPosting(false);
  };

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20 dir-rtl font-sans">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-sm">
            T
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 leading-none">TTT</h1>
            <span className="text-[10px] text-slate-400 font-semibold">منصة التواصل الحرة</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-[11px] font-bold border border-amber-200/60">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>الرئيسية</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-4 space-y-4">

        {/* Create Post Input Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="شارِك أفكارك بحرية ورأيك مع المجتمع..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition resize-none text-right"
            />
            
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => alert("ميزة رفع الصور ستكتمل في التحديث القادم!")}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 font-semibold px-2 py-1 rounded-lg hover:bg-slate-50 transition"
              >
                <ImageIcon className="w-4 h-4 text-amber-500" />
                <span>إضافة صورة</span>
              </button>

              <button
                type="submit"
                disabled={posting || !newPostContent.trim()}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {posting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>نشر</span>
                    <Send className="w-3.5 h-3.5 rotate-180" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Feed Posts List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
            <p className="text-xs font-semibold text-slate-400">جاري تحميل المنشورات...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center space-y-2 border border-slate-200/80">
            <p className="text-sm font-bold text-slate-700">لا توجد منشورات حالياً</p>
            <p className="text-xs text-slate-400">كن أول من يشارك فكرته وينشر منشوراً جديداً!</p>
          </div>
        ) : (
          posts.map((post) => {
            const isLiked = likedPosts[post.id] || false;
            return (
              <article 
                key={post.id} 
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3"
              >
                {/* User Info Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs shadow-sm">
                      {post.profiles?.full_name ? post.profiles.full_name.charAt(0) : "م"}
                    </div>
                    <div className="text-right">
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">
                        {post.profiles?.full_name || "مستخدم TTT"}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium">
                        @{post.profiles?.username || "user"}
                      </span>
                    </div>
                  </div>
                  
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(post.created_at).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Post Text Content */}
                <p className="text-xs text-slate-700 leading-relaxed text-right whitespace-pre-line">
                  {post.content}
                </p>

                {/* Post Image (If Exists) */}
                {post.image_url && (
                  <div className="rounded-xl overflow-hidden border border-slate-100">
                    <img 
                      src={post.image_url} 
                      alt="مرفق المنشور" 
                      className="w-full h-auto object-cover max-h-72" 
                    />
                  </div>
                )}

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 font-medium px-2 py-1 rounded-lg transition ${
                      isLiked ? "text-rose-500 bg-rose-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
                    <span>إعجاب</span>
                  </button>

                  <button className="flex items-center gap-1.5 font-medium px-2 py-1 rounded-lg hover:bg-slate-50 transition">
                    <MessageCircle className="w-4 h-4" />
                    <span>تعليق</span>
                  </button>

                  <button className="flex items-center gap-1.5 font-medium px-2 py-1 rounded-lg hover:bg-slate-50 transition">
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة</span>
                  </button>

                  <button className="p-1 rounded-lg hover:bg-slate-50 transition">
                    <Bookmark className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

              </article>
            );
          })
        )}

      </main>

    </div>
  );
}