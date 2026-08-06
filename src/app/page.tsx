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
  Lock,
  Users,
  EyeOff,
  Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Post {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  user_id: string;
  privacy?: "public" | "friends" | "private";
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
                  <img src="/logo.png" alt="TTT Logo" className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
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
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="TTT Logo" className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
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

        {/* ✍️ Create Post Card */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="بم تفكر اليوم؟ شارك أفكارك مع الجميع..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none text-right"
            />
            
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert("ميزة إضافة الصور ستفعل في الخطوة القادمة!")}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-medium px-2 py-1.5 rounded-lg hover:bg-slate-800 transition"
                >
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span>صورة</span>
                </button>

                {/* Privacy Selector */}
                <select
                  value={postPrivacy}
                  onChange={(e) => setPostPrivacy(e.target.value as any)}
                  className="bg-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 border border-slate-700 focus:outline-none"
                >
                  <option value="public">🌐 العامة</option>
                  <option value="friends">👥 الأصدقاء</option>
                  <option value="private">🔒 أنا فقط</option>
                </select>
              </div>

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

        {/* 📰 Feed Posts List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl p-8 text-center border border-slate-800">
            <p className="text-xs font-semibold text-slate-400">لا توجد منشورات لعرضها حالياً</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isLiked = likedPosts[post.id] || false;
            const isMenuOpen = activePostMenu === post.id;
            const isEditing = editingPostId === post.id;

            return (
              <article key={post.id} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3 shadow-md relative">
                
                {/* User & Options Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center font-bold text-xs shadow-inner">
                      T
                    </div>
                    <div className="text-right">
                      <h3 className="text-xs font-bold text-slate-200">مستخدم TTT</h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span>{new Date(post.created_at).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <Globe className="w-3 h-3 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  {/* ⚙️ Three Dots Menu Button */}
                  <div className="relative">
                    <button
                      onClick={() => setActivePostMenu(isMenuOpen ? null : post.id)}
                      className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {/* Dropdown Options Menu */}
                    {isMenuOpen && (
                      <div className="absolute left-0 top-8 w-44 bg-slate-950 border border-slate-800 rounded-xl shadow-xl z-30 py-1 font-semibold text-xs text-slate-300">
                        <button
                          onClick={() => {
                            setEditingPostId(post.id);
                            setEditContent(post.content);
                            setActivePostMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 text-right transition"
                        >
                          <Edit3 className="w-4 h-4 text-amber-400" />
                          <span>تعديل المنشور</span>
                        </button>

                        <button
                          onClick={() => alert("تم إخفاء هذا المنشور من خلاصتك.")}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 text-right transition"
                        >
                          <EyeOff className="w-4 h-4 text-slate-400" />
                          <span>إخفاء المنشور</span>
                        </button>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-500/10 text-rose-500 text-right transition border-t border-slate-800/60"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>حذف المنشور</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Post Box OR Normal Content */}
                {isEditing ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/60 rounded-xl p-3 text-xs text-slate-100 focus:outline-none"
                      rows={3}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingPostId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleSaveEdit(post.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                      >
                        حفظ التعديل
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-200 leading-relaxed text-right whitespace-pre-line">
                    {post.content}
                  </p>
                )}

                {/* Actions Bar (Likes, Comments, Share) */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-slate-400 text-xs">
                  <button
                    onClick={() => setLikedPosts((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
                      isLiked ? "text-rose-500 bg-rose-500/10 font-bold" : "hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
                    <span>إعجاب</span>
                  </button>

                  <button 
                    onClick={() => alert("نافذة التعليقات ستفتح في الخطوة القادمة!")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition font-medium"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>تعليق</span>
                  </button>

                  <button 
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition font-medium"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة</span>
                  </button>

                  <button className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition">
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