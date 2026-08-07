"use client";

import React, { useState, useEffect, useCallback, type FormEvent } from "react";
import { Search, MessageCircle, Plus, Loader2, Image as ImageIcon, Smile, Video, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import PostCard from "@/components/PostCard";

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

const avatarFallback = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80";

export default function HomePage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [stories, setStories] = useState<StoryData[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<ProfileData | null>(null);

  const initData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setCurrentUser(
        profile || { id: user.id, full_name: user.email?.split("@")[0] || null, avatar_url: null },
      );
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
    void initData();
  }, [initData]);

  const handleCreatePost = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPost.trim() || !currentUser) return;

    setPosting(true);
    const { error } = await supabase.from("posts").insert([{ user_id: currentUser.id, content: newPost.trim() }]);

    if (!error) {
      setNewPost("");
      void initData();
    } else {
      alert("حدث خطأ أثناء النشر: " + error.message);
    }
    setPosting(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-24 text-slate-900 dir-rtl font-sans">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black tracking-wider text-blue-600">facebook</h1>
          <div className="flex items-center gap-2">
            <Link href="/messages" className="rounded-full bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200">
              <MessageCircle className="h-5 w-5" />
            </Link>
            <Link href="/explore" className="rounded-full bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200">
              <Search className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-3 p-3">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900">القصص</h2>
            <span className="text-[11px] font-semibold text-blue-600">عرض الكل</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <div className="flex h-36 w-24 flex-shrink-0 flex-col justify-between rounded-[1.25rem] border border-slate-200 bg-gradient-to-br from-blue-600 to-indigo-600 p-2 text-white shadow-sm">
              <div className="mx-auto my-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-center text-[10px] font-bold">إنشاء قصة</span>
            </div>

            {stories.map((story) => (
              <div key={story.id} className="relative flex h-36 w-24 flex-shrink-0 flex-col justify-end overflow-hidden rounded-[1.25rem] border border-slate-200 shadow-sm">
                {story.media_url && (
                  <Image src={story.media_url} alt="Story" fill unoptimized className="object-cover opacity-80" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent" />
                <span className="relative z-10 truncate px-2 pb-2 text-[10px] font-bold text-white">
                  {story.profiles?.full_name || "مستخدم"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <section className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-2 text-right">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-900">ماذا يحدث اليوم؟</p>
                <p className="text-[10px] text-slate-500">شارك أفكارك مع أصدقائك</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
              <Image src={currentUser?.avatar_url || avatarFallback} alt="Your avatar" fill unoptimized className="object-cover" />
            </div>
            <form onSubmit={handleCreatePost} className="flex-1">
              <textarea
                rows={2}
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={`بم تفكر يا ${currentUser?.full_name || "صديق"}؟`}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-2.5 text-right text-xs text-slate-700 outline-none transition focus:border-blue-500"
              />
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1"><Video className="h-4 w-4 text-rose-500" /> فيديو</span>
                  <span className="flex items-center gap-1"><ImageIcon className="h-4 w-4 text-emerald-600" /> صورة</span>
                  <span className="flex items-center gap-1"><Smile className="h-4 w-4 text-amber-500" /> شعور</span>
                </div>
                <button
                  type="submit"
                  disabled={posting || !newPost.trim()}
                  className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>نشر</span>}
                </button>
              </div>
            </form>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center text-xs text-slate-400 shadow-sm">
            لا توجد منشورات حتى الآن، كن أول من ينشر!
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </main>
    </div>
  );
}