"use client";

import React, { useState, useEffect } from "react";
import { 
  ImageIcon, Send, Heart, MessageSquare, Share2, 
  Bookmark, ShieldCheck, Loader2 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import BottomNav from "@/components/BottomNav";

interface Post {
  id: string;
  created_at: string;
  content: string;
  author_name: string;
  author_handle: string;
}

export default function HomePage() {
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // جلب المنشورات من Supabase
  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // إنشاء منشور جديد
  const handleCreatePost = async () => {
    if (!postText.trim()) return;
    setIsPosting(true);

    const { error } = await supabase.from("posts").insert([
      {
        content: postText,
        author_name: "أدهم سيدي",
        author_handle: "@adham_sayed",
      },
    ]);

    if (!error) {
      setPostText("");
      fetchPosts();
    } else {
      alert("حدث خطأ أثناء النشر، تأكد من إعداد Supabase");
    }
    setIsPosting(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      
      {/* Top Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/90 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-amber-500/20">
            T
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-slate-900 leading-tight">TTT</h1>
            <p className="text-[10px] text-slate-500 font-medium">إحدى منصات Beta</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>آمن وبدون تتبع</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto p-3 space-y-3">
        
        {/* Create Post Box */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="شارِك أفكارك بحرية ورتّب أفكارك..."
            className="w-full bg-slate-50/50 text-slate-800 placeholder-slate-400 resize-none border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm leading-relaxed transition"
            rows={3}
          />
          <div className="flex items-center justify-between pt-1">
            <button className="text-slate-500 hover:text-amber-600 transition flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-slate-50">
              <ImageIcon className="w-4 h-4 text-amber-500" />
              <span>إضافة صورة</span>
            </button>
            <button 
              onClick={handleCreatePost}
              disabled={!postText.trim() || isPosting}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <span>نشر</span>
                  <Send className="w-3.5 h-3.5 rotate-180" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-8 text-slate-400 flex items-center justify-center gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            <span>جاري تحميل المنشورات...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            لا توجد منشورات بعد، كن أول من ينشر على TTT! 🚀
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-extrabold text-white text-xs shadow-sm">
                    {post.author_name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{post.author_name}</h4>
                    <p className="text-[10px] text-slate-400 dir-ltr text-right">{post.author_handle}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(post.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">{post.content}</p>
              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-slate-500 text-xs font-medium">
                <button className="flex items-center gap-1 hover:text-rose-500 transition"><Heart className="w-4 h-4" /><span className="text-[11px]">إعجاب</span></button>
                <button className="flex items-center gap-1 hover:text-amber-600 transition"><MessageSquare className="w-4 h-4" /><span className="text-[11px]">تعليق</span></button>
                <button className="flex items-center gap-1 hover:text-blue-500 transition"><Share2 className="w-4 h-4" /><span className="text-[11px]">مشاركة</span></button>
                <button className="flex items-center gap-1 hover:text-amber-600 transition"><Bookmark className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}

      </main>

      {/* استخدام المكون السحري للتنقل السلس */}
      <BottomNav activeTab="home" />

    </div>
  );
}