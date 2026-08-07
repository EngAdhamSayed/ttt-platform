"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, MessageCircle, Plus, Loader2, Image, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface ProfileData {
  id: string;
  user_number_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  rank_tier: string | null;
}

interface PostData {
  id: string;
  content: string;
  media_urls: string[] | null;
  created_at: string;
  profiles: ProfileData | null;
}

export default function HomePage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<ProfileData | null>(null);

  const initData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setCurrentUser(profile || { id: user.id, user_number_id: "10072519", full_name: user.email?.split("@")[0] || null, avatar_url: null, rank_tier: "millionaire_dev" });
    }

    const { data: postsData } = await supabase
      .from("posts")
      .select(`id, content, media_urls, created_at, profiles:user_id(id, user_number_id, full_name, avatar_url, rank_tier)`)
      .order("created_at", { ascending: false });

    if (postsData) setPosts(postsData as unknown as PostData[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !currentUser) return;

    setPosting(true);
    const { error } = await supabase.from("posts").insert([
      { user_id: currentUser.id, content: newPost.trim() }
    ]);

    if (!error) {
      setNewPost("");
      initData();
    } else {
      alert("حدث خطأ أثناء النشر: " + error.message);
    }
    setPosting(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-24 dir-rtl font-sans">
      {/* Header مع البراند الأصلي الخاص بـ TTT */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-wide leading-none">TTT Platform</h1>
            <span className="text-[9px] font-bold text-amber-600">Beta Edition</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link href="/messages" className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
            <MessageCircle className="w-4 h-4" />
          </Link>
          <Link href="/explore" className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
            <Search className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto p-3 space-y-3">
        {/* Stories Header */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            <div className="w-20 h-28 bg-slate-50 border border-dashed border-amber-300 rounded-2xl flex flex-col items-center justify-center gap-1 flex-shrink-0 cursor-pointer hover:bg-amber-50 transition">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700">إضافة قصة</span>
            </div>
          </div>
        </div>

        {/* Create Post Box */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs overflow-hidden">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="User" className="w-full h-full object-cover" />
              ) : (
                currentUser?.full_name?.charAt(0) || "A"
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="text-xs font-black text-slate-900">{currentUser?.full_name || "Adham Sayed"}</h3>
                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">👑 Founder</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">ID: #{currentUser?.user_number_id || "10072519"}</span>
            </div>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-2">
            <textarea
              rows={2}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={`بم تفكر يا ${currentUser?.full_name || 'Adham'}؟`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500 text-right resize-none"
            />
            
            <div className="flex justify-between items-center pt-1">
              <button type="button" className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 font-bold px-2 py-1 rounded-lg bg-slate-100">
                <Image className="w-3.5 h-3.5 text-emerald-600" />
                <span>صورة/فيديو</span>
              </button>

              <button
                type="submit"
                disabled={posting || !newPost.trim()}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1 disabled:opacity-50 shadow-sm transition"
              >
                {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>نشر</span>}
              </button>
            </div>
          </form>
        </div>

        {/* Feed Posts */}
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-amber-500" /></div>
        ) : posts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-xs text-slate-400 border border-slate-200 shadow-sm flex flex-col items-center gap-2">
            <Sparkles className="w-8 h-8 text-amber-300" />
            <span>لا توجد منشورات حتى الآن، كن أول من ينشر!</span>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-2 text-right">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs overflow-hidden">
                  {post.profiles?.avatar_url ? (
                    <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    post.profiles?.full_name?.charAt(0) || "U"
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{post.profiles?.full_name || "مستخدم TTT"}</h3>
                  <span className="text-[9px] text-slate-400 font-mono">#{post.profiles?.user_number_id}</span>
                </div>
              </div>
              <p className="text-xs text-slate-800 whitespace-pre-line">{post.content}</p>
            </article>
          ))
        )}
      </main>
    </div>
  );
}