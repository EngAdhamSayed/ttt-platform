"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, MessageCircle, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface ProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface PostData {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: ProfileData | null;
}

interface StoryData {
  id: string;
  media_url: string;
  profiles: ProfileData | null;
}

export default function HomePage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [stories, setStories] = useState<StoryData[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<ProfileData | null>(null);

  const initData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setCurrentUser(profile || { id: user.id, full_name: user.email?.split("@")[0] || null, avatar_url: null });
    }

    const { data: postsData } = await supabase
      .from("posts")
      .select(`id, content, image_url, created_at, profiles:user_id(id, full_name, avatar_url)`)
      .order("created_at", { ascending: false });

    const { data: storiesData } = await supabase
      .from("stories")
      .select(`id, media_url, profiles:user_id(id, full_name, avatar_url)`)
      .order("created_at", { ascending: false });

    if (postsData) setPosts(postsData as unknown as PostData[]);
    if (storiesData) setStories(storiesData as unknown as StoryData[]);
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
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-black text-blue-600 tracking-wider">facebook</h1>
        <div className="flex items-center gap-2">
          <Link href="/messages" className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200">
            <MessageCircle className="w-5 h-5" />
          </Link>
          <Link href="/explore" className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200">
            <Search className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto p-3 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="w-24 h-36 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between p-2 flex-shrink-0 relative shadow-sm">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mx-auto my-auto">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-center text-slate-800">إنشاء قصة</span>
          </div>

          {stories.map((story) => (
            <div key={story.id} className="w-24 h-36 bg-slate-800 rounded-2xl border border-slate-200 flex flex-col justify-end p-2 flex-shrink-0 relative overflow-hidden shadow-sm">
              {story.media_url && <img src={story.media_url} alt="Story" className="absolute inset-0 w-full h-full object-cover opacity-80" />}
              <span className="relative z-10 text-[10px] font-bold text-white truncate">{story.profiles?.full_name}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-2">
          <form onSubmit={handleCreatePost} className="space-y-2">
            <textarea
              rows={2}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={`بم تفكر يا ${currentUser?.full_name || ''}؟`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500 text-right"
            />
            <div className="flex justify-between items-center border-t border-slate-100 pt-2">
              <span className="text-[11px] font-bold text-slate-500">إضافة منشور</span>
              <button
                type="submit"
                disabled={posting || !newPost.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1 disabled:opacity-50"
              >
                {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>نشر</span>}
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div>
        ) : posts.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl text-center text-xs text-slate-400 border border-slate-200">
            لا توجد منشورات حتى الآن، كن أول من ينشر!
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-2 text-right">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-xs overflow-hidden">
                  {post.profiles?.avatar_url ? (
                    <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    post.profiles?.full_name?.charAt(0) || "U"
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{post.profiles?.full_name || "مستخدم TTT"}</h3>
                  <span className="text-[10px] text-slate-400">{new Date(post.created_at).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}</span>
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