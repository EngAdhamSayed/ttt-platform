"use client";

import React, { useState, useEffect } from "react";
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
  LogOut,
  MoreHorizontal,
  Trash2,
  Edit3,
  Globe,
  EyeOff
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Post {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  user_id: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePostMenu, setActivePostMenu] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [postPrivacy, setPostPrivacy] = useState<"public" | "friends" | "private">("public");

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
    } else {
      alert("حدث خطأ أثناء النشر: " + error.message);
    }
    setPosting(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("هل أنت تأكد من رغبتك في حذف هذا المنشور؟")) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (!error) {
      setPosts(posts.filter((p) => p.id !== postId));
      setActivePostMenu(null);
    } else {
      alert("تعذر حذف المنشور.");
    }
  };

  const handleSaveEdit = async (postId: string) => {
    if (!editContent.trim()) return;

    const { error } = await supabase
      .from("posts")
      .update({ content: editContent })
      .eq("id", postId);

    if (!error) {
      setPosts(posts.map((p) => (p.id === postId ? { ...p, content: editContent } : p)));
      setEditingPostId(null);
      setActivePostMenu(null);
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-24 dir-rtl font-sans">
      
      {/* 🔴 Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative w-72 bg-white border-l border-slate-200 p-5 space-y-6 z-50 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="TTT" className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span className="font-black text-slate-900 text-lg">TTT Platform</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 text-xs font-semibold">
                <a href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition">
                  <User className="w-4 h-4 text-amber-500" />
                  <span>الملف الشخصي</span>
                </a>
                <a href="/notifications" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>الإشعارات</span>
                </a>
                <a href="/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition">
                  <Settings className="w-4 h-4 text-amber-500" />
                  <span>الإعدادات</span>
                </a>
              </nav>
            </div>

            <button className="flex items-center gap-2 text-xs font-bold text-rose-600 p-3 hover:bg-rose-50 rounded-xl transition">
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}

      {/* 🔴 Header Bar - فاتح ونظيف */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between max-w-md mx-auto shadow-sm">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-slate-900 tracking-wider">TTT</span>
          <img src="/logo.png" alt="TTT Logo" className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-4 space-y-4">

        {/* 🔍 Search Bar */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن المنشورات والأفكار..."
            className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-2xl pr-10 pl-4 py-3 focus:outline-none focus:border-amber-500 transition text-right placeholder-slate-400 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
        </div>

        {/* ✍️ Create Post Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="شارِك أفكارك بحرية ورأيك مع المجتمع..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition resize-none text-right"
            />
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert("ميزة رفع الصور قادمة!")}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 font-semibold px-2 py-1.5 rounded-lg hover:bg-slate-50 transition"
                >
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span>صورة</span>
                </button>

                <select
                  value={postPrivacy}
                  onChange={(e) => setPostPrivacy(e.target.value as any)}
                  className="bg-slate-100 text-[11px] text-slate-700 rounded-lg px-2 py-1 border border-slate-200 focus:outline-none"
                >
                  <option value="public">🌐 العامة</option>
                  <option value="friends">👥 الأصدقاء</option>
                  <option value="private">🔒 أنا فقط</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={posting || !newPostContent.trim()}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
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

        {/* 📰 Posts Feed */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm space-y-1">
            <p className="text-sm font-bold text-slate-700">لا توجد منشورات حالياً</p>
            <p className="text-xs text-slate-400">كن أول من يشارك فكرته وينشر منشوراً جديداً!</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isLiked = likedPosts[post.id] || false;
            const isMenuOpen = activePostMenu === post.id;
            const isEditing = editingPostId === post.id;

            return (
              <article key={post.id} className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3 shadow-sm relative">
                
                {/* User Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs shadow-sm">
                      T
                    </div>
                    <div className="text-right">
                      <h3 className="text-xs font-bold text-slate-900">مستخدم TTT</h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>{new Date(post.created_at).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <Globe className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* ⚙️ 3 Dots */}
                  <div className="relative">
                    <button
                      onClick={() => setActivePostMenu(isMenuOpen ? null : post.id)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute left-0 top-8 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 font-semibold text-xs text-slate-700">
                        <button
                          onClick={() => {
                            setEditingPostId(post.id);
                            setEditContent(post.content);
                            setActivePostMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-right transition"
                        >
                          <Edit3 className="w-4 h-4 text-amber-600" />
                          <span>تعديل المنشور</span>
                        </button>

                        <button
                          onClick={() => alert("تم إخفاء المنشور.")}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-right transition"
                        >
                          <EyeOff className="w-4 h-4 text-slate-400" />
                          <span>إخفاء المنشور</span>
                        </button>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-600 text-right transition border-t border-slate-100"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>حذف المنشور</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content / Edit Mode */}
                {isEditing ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-slate-50 border border-amber-500 rounded-xl p-3 text-xs text-slate-800 focus:outline-none"
                      rows={3}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingPostId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleSaveEdit(post.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600"
                      >
                        حفظ
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed text-right whitespace-pre-line">
                    {post.content}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs">
                  <button
                    onClick={() => setLikedPosts((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
                      isLiked ? "text-rose-500 bg-rose-50 font-bold" : "hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
                    <span>إعجاب</span>
                  </button>

                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition font-medium">
                    <MessageCircle className="w-4 h-4" />
                    <span>تعليق</span>
                  </button>

                  <button 
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition font-medium"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة</span>
                  </button>

                  <button className="p-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition">
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