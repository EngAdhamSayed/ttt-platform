"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Menu, 
  Search, 
  Heart, 
  MessageCircle, 
  Share2, 
  ImageIcon, 
  Send, 
  Loader2, 
  Bookmark,
  X,
  User,
  Settings,
  Bell,
  LogOut
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
  };
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select(`id, content, image_url, created_at, user_id`)
      .order("created_at", { ascending: false });

    if (data) setPosts(data as Post[]);
    setLoading(false);
  };

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
      { user_id: user.id, content: newPostContent.trim() },
    ]);

    if (!error) {
      setNewPostContent("");
      fetchPosts();
    }
    setPosting(false);
  };

  const filteredPosts = posts.filter((p) =>
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 dir-rtl font-sans">
      
      {/* 🔴 Sidebar Overlay Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative w-72 bg-slate-900 border-l border-slate-800 p-5 space-y-6 z-50 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Image src="/logo.png" alt="TTT Logo" width={32} height={32} className="object-contain" />
                  <span className="font-black text-amber-400 text-lg">TTT Platform</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2 text-xs font-semibold">
                <a href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>الملف الشخصي</span>
                </a>
                <a href="/notifications" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>الإشعارات</span>
                </a>
                <a href="/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>الإعدادات</span>
                </a>
              </nav>
            </div>

            <button className="flex items-center gap-2 text-xs font-bold text-rose-500 p-3 hover:bg-rose-500/10 rounded-xl transition">
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}

      {/* 🔴 Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between max-w-md mx-auto">
        {/* الثلاث شرط على اليمين */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* اللوجو واسم TTT على الشمال */}
        <div className="flex items-center gap-2.5 dir-ltr">
          <div className="w-8 h-8 relative flex items-center justify-center">
            <Image src="/logo.png" alt="TTT Logo" width={32} height={32} className="object-contain" priority />
          </div>
          <span className="text-lg font-black text-white tracking-wider">TTT</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-4">

        {/* 🔍 Search Bar */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن المنشورات والأفكار..."
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-2xl pr-10 pl-4 py-3 focus:outline-none focus:border-amber-500 transition text-right placeholder-slate-500 shadow-inner"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 pointer-events-none" />
        </div>

        {/* Create Post Input */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="عن ماذا تفكر اليوم؟ شارك أفكارك..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none text-right"
            />
            
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => alert("رفع الصور قادم قريباً!")}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-medium px-2 py-1 rounded-lg transition"
              >
                <ImageIcon className="w-4 h-4 text-amber-500" />
                <span>صورة</span>
              </button>

              <button
                type="submit"
                disabled={posting || !newPostContent.trim()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <span>نشر</span>
                    <Send className="w-3.5 h-3.5 rotate-180" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Feed Posts */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl p-8 text-center border border-slate-800">
            <p className="text-xs font-semibold text-slate-400">لا توجد نتائج لعرضها</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isLiked = likedPosts[post.id] || false;
            return (
              <article key={post.id} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center font-bold text-xs">
                      T
                    </div>
                    <div className="text-right">
                      <h3 className="text-xs font-bold text-slate-200">مستخدم TTT</h3>
                      <span className="text-[10px] text-slate-500">منذ قليل</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed text-right">{post.content}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-slate-400 text-xs">
                  <button
                    onClick={() => setLikedPosts((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition ${
                      isLiked ? "text-rose-500 bg-rose-500/10" : "hover:text-slate-200"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
                    <span>إعجاب</span>
                  </button>

                  <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:text-slate-200">
                    <MessageCircle className="w-4 h-4" />
                    <span>تعليق</span>
                  </button>

                  <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:text-slate-200">
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة</span>
                  </button>

                  <button className="p-1 hover:text-slate-200">
                    <Bookmark className="w-4 h-4 text-slate-500" />
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