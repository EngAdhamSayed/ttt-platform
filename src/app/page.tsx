"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Menu, Search, MessageCircle, Plus, Loader2, Image as ImageIcon, 
  Smile, Send, Heart, MessageSquare, Share2, Sparkles, X, User, Settings, LogOut, Bookmark, MoreVertical 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProfileData {
  id: string;
  user_number_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  rank_tier: string | null;
  role: string | null;
}

interface PostData {
  id: string;
  content: string;
  media_urls: string[] | null;
  created_at: string;
  visibility: string;
  profiles: ProfileData | null;
}

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<ProfileData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const initData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile) setCurrentUser(profile as ProfileData);
    }

    const { data: postsData } = await supabase
      .from("posts")
      .select(`id, content, media_urls, created_at, visibility, profiles:user_id(id, user_number_id, full_name, avatar_url, rank_tier, role)`)
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
    }
    setPosting(false);
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim() || !currentUser) return;
    const { error } = await supabase.from("comments").insert([
      { post_id: postId, user_id: currentUser.id, content: commentText.trim() }
    ]);
    if (!error) {
      setCommentText("");
      alert("تم إضافة التعليق بنجاح!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 dir-rtl font-sans relative">
      {/* Drawer Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="relative w-72 max-w-[80%] bg-white h-full shadow-2xl p-5 flex flex-col justify-between z-10 text-right">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-black text-base text-slate-900">TTT Platform</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              {currentUser && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-sm overflow-hidden">
                    {currentUser.avatar_url ? <img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : currentUser.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{currentUser.full_name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">#{currentUser.user_number_id}</span>
                  </div>
                </div>
              )}

              <nav className="space-y-1 text-xs font-bold text-slate-700">
                <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition">
                  <User className="w-4 h-4" />
                  <span>الصفحة الشخصية</span>
                </Link>
                <Link href="/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition">
                  <Settings className="w-4 h-4" />
                  <span>الإعدادات والخصوصية</span>
                </Link>
              </nav>
            </div>

            <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="flex items-center gap-2 text-xs font-bold text-red-600 p-3 rounded-xl hover:bg-red-50 transition w-full">
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-base font-black text-slate-900">TTT Beta</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/explore" className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition"><Search className="w-5 h-5" /></Link>
          <Link href="/messages" className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition"><MessageCircle className="w-5 h-5" /></Link>
        </div>
      </header>

      {/* Main Feed */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Post Creation */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs overflow-hidden">
              {currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt="User" className="w-full h-full object-cover" /> : currentUser?.full_name?.charAt(0)}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">{currentUser?.full_name}</h3>
              <span className="text-[10px] text-slate-400 font-mono">#{currentUser?.user_number_id}</span>
            </div>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              rows={2}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={`بم تفكر يا ${currentUser?.full_name || ''}؟`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-orange-500 text-right resize-none"
            />
            <div className="flex justify-between items-center pt-1">
              <div className="flex gap-2">
                <button type="button" className="flex items-center gap-1 text-[11px] text-slate-600 font-bold px-2.5 py-1.5 rounded-xl bg-slate-100"><ImageIcon className="w-3.5 h-3.5 text-slate-500" /><span>صورة/فيديو</span></button>
                <button type="button" className="flex items-center gap-1 text-[11px] text-slate-600 font-bold px-2.5 py-1.5 rounded-xl bg-slate-100"><Smile className="w-3.5 h-3.5 text-slate-500" /><span>شعور</span></button>
              </div>
              <button type="submit" disabled={posting || !newPost.trim()} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1 disabled:opacity-50">
                {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>نشر</span>
              </button>
            </div>
          </form>
        </div>

        {/* Posts Stream */}
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-orange-500" /></div>
        ) : posts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-xs text-slate-400 border border-slate-200 shadow-sm">لا توجد منشورات حتى الآن، كن أول من ينشر!</div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 text-right">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs overflow-hidden">
                    {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : post.profiles?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{post.profiles?.full_name}</h3>
                    <span className="text-[9px] text-slate-400 font-mono">#{post.profiles?.user_number_id}</span>
                  </div>
                </div>
                <button><MoreVertical className="w-4 h-4 text-slate-400" /></button>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">{post.content}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs font-bold">
                <button className="flex items-center gap-1.5 hover:text-orange-600 flex-1 justify-center py-1"><Heart className="w-4 h-4" /><span>تفاعل</span></button>
                <button onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)} className="flex items-center gap-1.5 hover:text-orange-600 flex-1 justify-center py-1 border-x border-slate-100"><MessageSquare className="w-4 h-4" /><span>تعليق</span></button>
                <button className="flex items-center gap-1.5 hover:text-orange-600 flex-1 justify-center py-1"><Share2 className="w-4 h-4" /><span>مشاركة</span></button>
              </div>

              {/* Inline Comments Section */}
              {activeCommentPostId === post.id && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="اكتب تعليقك هنا..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-orange-500 text-right"
                    />
                    <button onClick={() => handleAddComment(post.id)} className="bg-orange-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs">إرسال</button>
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </main>
    </div>
  );
}