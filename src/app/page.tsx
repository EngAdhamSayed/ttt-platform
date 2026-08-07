"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Menu, Search, MessageCircle, Plus, Loader2, 
  Image as ImageIcon, Smile, Send, Heart, MessageSquare, Share2, Sparkles 
} from "lucide-react";
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
      setCurrentUser(profile || { 
        id: user.id, 
        user_number_id: "10072519", 
        full_name: user.email?.split("@")[0] || "Adham Sayed", 
        avatar_url: null, 
        rank_tier: "millionaire_dev" 
      });
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
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 pb-24 dir-rtl font-sans">
      
      {/* 1️⃣ الهيدر العلوي بالضبط كما بالرسمة (Menu + Beta + Search + Chat) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100 px-4 py-2.5 flex items-center justify-between shadow-sm">
        {/* جهة اليمين: القائمة الجانبية واللوجو والشعار */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition">
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-sm font-black text-slate-900 tracking-tight leading-none">TTT</span>
              <span className="text-[9px] font-extrabold text-orange-600">Beta Edition</span>
            </div>
          </div>
        </div>

        {/* جهة اليسار: أيقونة البحث والمحادثات */}
        <div className="flex items-center gap-2">
          <Link href="/explore" className="p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition">
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/messages" className="p-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition">
            <MessageCircle className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto p-3.5 space-y-4">

        {/* 2️⃣ قسم القصص الدائرية (Story Section كما بالرسمة بالضبط) */}
        <div className="bg-white p-3 rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
            
            {/* قصة المستخدم الخاصة + علامة بلس (+) */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
              <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-orange-400 bg-orange-50 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-xs overflow-hidden">
                  {currentUser?.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.full_name?.charAt(0) || "A"
                  )}
                </div>
                {/* علامة + الصغيرة */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700">إنشاء قصة</span>
            </div>

            {/* قصص الأصدقاء (الدائرة الكبيرة وبداخلها/متداخلة معها الدائرة الأصغر لصورة صاحب القصة) */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
              <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-orange-500 to-amber-400 shadow-md">
                <div className="w-full h-full rounded-full border-2 border-white bg-slate-700 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                  <span>قصة</span>
                </div>
                {/* الدائرة الصغيرة المتداخلة لصورة المستخدم */}
                <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full border-2 border-white bg-slate-900 text-orange-400 font-bold flex items-center justify-center text-[9px] overflow-hidden shadow-sm">
                  U
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700 truncate max-w-[64px]">مستخدم TTT</span>
            </div>

          </div>
        </div>

        {/* 3️⃣ صندوق إنشاء منشور (Create Post Box مطابق للرسمة) */}
        <div className="bg-white rounded-3xl p-4 border border-orange-100 shadow-sm space-y-3">
          {/* صورة البروفايل + اسم المستخدم + رانك المستخدم */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-orange-400 font-bold flex items-center justify-center text-sm overflow-hidden ring-2 ring-orange-500/20">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="User" className="w-full h-full object-cover" />
              ) : (
                currentUser?.full_name?.charAt(0) || "A"
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-slate-900">{currentUser?.full_name || "Adham Sayed"}</h3>
                <span className="text-[9px] bg-orange-100 text-orange-700 font-black px-2 py-0.5 rounded-full border border-orange-200">👑 المطور</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">#{currentUser?.user_number_id || "10072519"}</span>
            </div>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-3">
            {/* حقل الإدخال: بم تفكر يا [اسم المستخدم]؟ */}
            <textarea
              rows={2}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={`بم تفكر يا ${currentUser?.full_name || 'Adham Sayed'}؟`}
              className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl p-3 text-xs focus:outline-none focus:border-orange-500 text-right resize-none placeholder-slate-400"
            />
            
            {/* أزرار الإضافة السريعة: (صورة/فيديو - شعور - زر النشر) */}
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-50">
              <div className="flex items-center gap-1">
                <button type="button" className="flex items-center gap-1 text-[11px] text-orange-600 font-bold px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 transition">
                  <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                  <span>صورة/فيديو</span>
                </button>
                <button type="button" className="flex items-center gap-1 text-[11px] text-amber-600 font-bold px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 transition">
                  <Smile className="w-3.5 h-3.5 text-amber-500" />
                  <span>شعور</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={posting || !newPost.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-1.5 rounded-xl text-xs flex items-center gap-1 disabled:opacity-50 shadow-md shadow-orange-500/20 transition"
              >
                {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> <span>نشر</span></>}
              </button>
            </div>
          </form>
        </div>

        {/* 4️⃣ قائمة المنشورات (Post Card مطابق للرسمة) */}
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-orange-500" /></div>
        ) : posts.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl text-center text-xs text-slate-400 border border-orange-100 shadow-sm flex flex-col items-center gap-2">
            <Sparkles className="w-8 h-8 text-orange-300" />
            <span>لا توجد منشورات حتى الآن، كن أول من ينشر!</span>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="bg-white rounded-3xl p-4 border border-orange-100 shadow-sm space-y-3 text-right">
              {/* هيدر الكارت: الصورة + الاسم + الرانك + وقت النشر */}
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-orange-400 font-bold flex items-center justify-center text-xs overflow-hidden ring-2 ring-orange-400/30">
                    {post.profiles?.avatar_url ? (
                      <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      post.profiles?.full_name?.charAt(0) || "U"
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-slate-900">{post.profiles?.full_name || "مستخدم TTT"}</h3>
                      <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                        #{post.profiles?.user_number_id}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400">الآن</span>
                  </div>
                </div>
              </div>

              {/* محتوى المنشور */}
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">{post.content}</p>

              {/* شريط الأزرار السفلي للتفاعل: (تفاعل/لايك - تعليق - مشاركة) */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs font-bold">
                <button className="flex items-center gap-1.5 hover:text-orange-600 transition flex-1 justify-center py-1">
                  <Heart className="w-4 h-4" />
                  <span>تفاعل</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-orange-600 transition flex-1 justify-center py-1 border-x border-slate-100">
                  <MessageSquare className="w-4 h-4" />
                  <span>تعليق</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-orange-600 transition flex-1 justify-center py-1">
                  <Share2 className="w-4 h-4" />
                  <span>مشاركة</span>
                </button>
              </div>
            </article>
          ))
        )}

      </main>
    </div>
  );
}