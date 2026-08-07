"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [postsResults, setPostsResults] = useState<any[]>([]);
  const [usersResults, setUsersResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setPostsResults([]);
      setUsersResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    setLoading(true);

    // 1. البحث في المنشورات
    const { data: posts } = await supabase
      .from("posts")
      .select(`id, content, created_at, profiles:user_id(full_name, avatar_url)`)
      .ilike("content", `%${searchQuery}%`)
      .limit(10);

    // 2. البحث في الملفات الشخصية للمستخدمين
    const { data: users } = await supabase
      .from("profiles")
      .select(`id, full_name, avatar_url, bio`)
      .ilike("full_name", `%${searchQuery}%`)
      .limit(10);

    if (posts) setPostsResults(posts);
    if (users) setUsersResults(users);

    setLoading(false);
  };

  const handleSendFriendRequest = async (receiverId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("friendships").insert([
      { sender_id: user.id, receiver_id: receiverId, status: "pending" },
    ]);

    if (!error) {
      alert("تم إرسال طلب الصداقة بنجاح!");
    } else {
      alert("تعذر إرسال الطلب أو تم إرساله سابقاً.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-right dir-rtl font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm -mx-4 -mt-4 mb-4">
        <h1 className="text-lg font-black text-slate-900">استكشف</h1>
      </header>

      <main className="max-w-md mx-auto space-y-4">
        {/* Search Bar Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن أشخاص، مجموعات، أو منشورات..."
            className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-2xl pr-10 pl-4 py-3 focus:outline-none focus:border-blue-600 transition text-right shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
        </div>

        {/* Results / Empty States */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
          </div>
        ) : !searchQuery.trim() ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm">
            <p className="text-xs text-slate-500 font-medium">
              ابدأ البحث لاستكشاف المحتوى والأصدقاء في المنصة
            </p>
          </div>
        ) : postsResults.length === 0 && usersResults.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm">
            <p className="text-xs text-slate-500 font-medium">
              لم يتم العثور على أي نتائج تطابق "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Users Search Results */}
            {usersResults.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-bold text-slate-600">المستخدمين</h2>
                <div className="space-y-2">
                  {usersResults.map((usr) => (
                    <div
                      key={usr.id}
                      className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-xs">
                          {usr.avatar_url ? (
                            <img
                              src={usr.avatar_url}
                              alt={usr.full_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            usr.full_name?.charAt(0).toUpperCase() || "U"
                          )}
                        </div>
                        <div className="text-right">
                          <h3 className="text-xs font-bold text-slate-900">
                            {usr.full_name}
                          </h3>
                          {usr.bio && (
                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {usr.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSendFriendRequest(usr.id)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>إضافة</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Posts Search Results */}
            {postsResults.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-bold text-slate-600">المنشورات</h2>
                <div className="space-y-2">
                  {postsResults.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-right"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-xs">
                          {post.profiles?.full_name?.charAt(0) || "U"}
                        </div>
                        <h3 className="text-xs font-bold text-slate-900">
                          {post.profiles?.full_name || "مستخدم TTT"}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-800 whitespace-pre-line">
                        {post.content}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}