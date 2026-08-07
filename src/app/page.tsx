"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Loader2, Image as ImageIcon, Send, Heart, MessageCircle, 
  Share2, Plus, CheckCircle2, ShieldCheck, Crown, Sparkles 
} from "lucide-react";

interface UserProfile {
  id: string;
  user_number_id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  role: string;
  rank_tier: string;
}

interface PostItem {
  id: string;
  content: string;
  media_urls: string[] | null;
  created_at: string;
  profiles: UserProfile;
  post_reactions: { id: string }[];
  comments: { id: string }[];
}

interface StoryItem {
  id: string;
  media_url: string;
  profiles: UserProfile;
}

export default function HomePage() {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [newPostText, setNewPostText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // جلب البيانات الأساسية
  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 1. جلب بيانات المستخدم الحالي
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profileData) setCurrentProfile(profileData as UserProfile);

      // 2. جلب المنشورات الحقيقية
      const { data: postsData } = await supabase
        .from("posts")
        .select(`
          id, content, media_urls, created_at,
          profiles:user_id(id, user_number_id, full_name, avatar_url, is_verified, role, rank_tier),
          post_reactions(id),
          comments(id)
        `)
        .order("created_at", { ascending: false });

      if (postsData) setPosts(postsData as unknown as PostItem[]);

      // 3. جلب القصص الشغالة (خلال 24 ساعة)
      const { data: storiesData } = await supabase
        .from("stories")
        .select(`
          id, media_url,
          profiles:user_id(id, user_number_id, full_name, avatar_url, is_verified, role, rank_tier)
        `)
        .gt("expires_at", new Date().toISOString());

      if (storiesData) setStories(storiesData as unknown as StoryItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // إنشاء منشور جديد
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() || !currentProfile) return;

    setPosting(true);
    const { error } = await supabase.from("posts").insert([
      {
        user_id: currentProfile.id,
        content: newPostText.trim(),
      },
    ]);

    if (!error) {
      setNewPostText("");
      fetchData(); // تحديث الصفحة
    } else {
      alert("حدث خطأ أثناء النشر: " + error.message);
    }
    setPosting(false);
  };

  // تفاعل إعجاب (Like)
  const handleLike = async (postId: string) => {
    if (!currentProfile) return;
    await supabase.from("post_reactions").insert([
      { post_id: postId, user_id: currentProfile.id, type: "like" },
    ]);
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-24 dir-rtl font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black text-blue-600 tracking-wider">facebook</h1>
          <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
            TTT Edition
          </span>
        </div>
        {currentProfile && (
          <div className="text-left">
            <span className="text-[11px] font-bold text-slate-500 block">
              ID: #{currentProfile.user_number_id}
            </span>
          </div>
        )}
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* قسم القصص (Stories) */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* زر إضافة قصة */}
          <div className="w-24 h-36 bg-white border border-slate-200 rounded-2xl flex-shrink-0 flex flex-col items-center justify-between p-2 shadow-sm relative overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-4">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">إنشاء قصة</span>
          </div>

          {/* عرض قصص المستخدمين */}
          {stories.map((story) => (
            <div
              key={story.id}
              className="w-24 h-36 rounded-2xl flex-shrink-0 relative overflow-hidden shadow-sm border border-slate-200 bg-slate-800"
            >
              <img src={story.media_url} alt="Story" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-2 right-2 w-7 h-7 rounded-full border-2 border-blue-500 bg-slate-900 overflow-hidden flex items-center justify-center text-[10px] text-white font-bold">
                {story.profiles?.avatar_url ? (
                  <img src={story.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  story.profiles?.full_name?.charAt(0) || "U"
                )}
              </div>
            </div>
          ))}
        </div>

        {/* صندوق كتابة منشور (Create Post) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
              {currentProfile?.avatar_url ? (
                <img src={currentProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                currentProfile?.full_name?.charAt(0) || "U"
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900">{currentProfile?.full_name}</span>
                {currentProfile?.rank_tier === "millionaire_dev" && (
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 block">مُعرف الحساب: #{currentProfile?.user_number_id}</span>
            </div>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-2">
            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder={`بم تفكر يا ${currentProfile?.full_name?.split(" ")[0]}؟`}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-600 resize-none text-right"
            />

            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-semibold"
              >
                <ImageIcon className="w-4 h-4 text-green-500" />
                <span>صورة/فيديو</span>
              </button>

              <button
                type="submit"
                disabled={posting || !newPostText.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 disabled:opacity-50 transition"
              >
                {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>نشر</span>
              </button>
            </div>
          </form>
        </div>

        {/* عرض المنشورات (Feed) */}
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-xs text-slate-400 border border-slate-200 shadow-sm space-y-2">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
              <p>لا توجد منشورات حتى الآن، كن أول من ينشر!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-right">
                {/* معلومات الناشر */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-xs overflow-hidden">
                      {post.profiles?.avatar_url ? (
                        <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        post.profiles?.full_name?.charAt(0) || "U"
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900">{post.profiles?.full_name}</span>
                        {post.profiles?.is_verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
                        )}
                        {post.profiles?.role === "admin" && (
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        #{post.profiles?.user_number_id} • {new Date(post.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  {post.profiles?.rank_tier === "millionaire_dev" && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                      <Crown className="w-3 h-3 fill-amber-500" />
                      <span>Founder</span>
                    </span>
                  )}
                </div>

                {/* نص المنشور */}
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                {/* أزرار التفاعل */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 hover:text-red-500 transition font-medium"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{post.post_reactions?.length || 0} إعجاب</span>
                  </button>

                  <button className="flex items-center gap-1 hover:text-blue-600 transition font-medium">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments?.length || 0} تعليق</span>
                  </button>

                  <button className="flex items-center gap-1 hover:text-slate-800 transition font-medium">
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}