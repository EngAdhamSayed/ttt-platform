"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface PostItem {
  id: string;
  content: string;
  created_at: string;
  profiles: UserProfile | null;
}

const avatarFallback = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [postsResults, setPostsResults] = useState<PostItem[]>([]);
  const [usersResults, setUsersResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setPostsResults([]);
      setUsersResults([]);
      return;
    }

    setLoading(true);

    const { data: posts } = await supabase
      .from("posts")
      .select(`id, content, created_at, profiles:user_id(id, full_name, avatar_url, bio)`)
      .ilike("content", `%${query}%`)
      .limit(10);

    const { data: users } = await supabase
      .from("profiles")
      .select(`id, full_name, avatar_url, bio`)
      .ilike("full_name", `%${query}%`)
      .limit(10);

    if (posts) setPostsResults(posts as unknown as PostItem[]);
    if (users) setUsersResults(users as UserProfile[]);

    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void handleSearch(searchQuery);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleSendFriendRequest = async (receiverId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("friendships").insert([{ sender_id: user.id, receiver_id: receiverId, status: "pending" }]);

    if (!error) {
      alert("تم إرسال طلب الصداقة بنجاح!");
    } else {
      alert("تعذر إرسال الطلب أو تم إرساله سابقاً.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-24 text-right dir-rtl font-sans">
      <header className="sticky top-0 z-40 -mx-4 -mt-4 mb-4 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-lg font-black text-slate-900">استكشف</h1>
      </header>

      <main className="mx-auto max-w-2xl space-y-4">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن أشخاص، مجموعات، أو منشورات..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-10 pl-4 text-right text-xs text-slate-800 shadow-sm outline-none transition focus:border-blue-600"
          />
          <Search className="pointer-events-none absolute right-3.5 h-4 w-4 text-slate-400" />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : !searchQuery.trim() ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-xs font-medium text-slate-500">ابدأ البحث لاستكشاف المحتوى والأصدقاء في المنصة</p>
          </div>
        ) : postsResults.length === 0 && usersResults.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-xs font-medium text-slate-500">لم يتم العثور على نتائج تطابق هذا البحث</p>
          </div>
        ) : (
          <div className="space-y-4">
            {usersResults.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-bold text-slate-600">المستخدمين</h2>
                <div className="space-y-2">
                  {usersResults.map((usr) => (
                    <div key={usr.id} className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-800 text-xs font-bold text-amber-400">
                          <Image src={usr.avatar_url || avatarFallback} alt={usr.full_name || "User"} fill unoptimized className="object-cover" />
                        </div>
                        <div className="text-right">
                          <h3 className="text-xs font-bold text-slate-900">{usr.full_name}</h3>
                          {usr.bio && <p className="max-w-36 truncate text-[10px] text-slate-400">{usr.bio}</p>}
                        </div>
                      </div>

                      <button
                        onClick={() => void handleSendFriendRequest(usr.id)}
                        className="flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>إضافة</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {postsResults.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-bold text-slate-600">المنشورات</h2>
                <div className="space-y-2">
                  {postsResults.map((post) => (
                    <article key={post.id} className="space-y-2 rounded-[1.25rem] border border-slate-200 bg-white p-3.5 text-right shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-amber-400">
                          {post.profiles?.full_name?.charAt(0) || "U"}
                        </div>
                        <h3 className="text-xs font-bold text-slate-900">{post.profiles?.full_name || "مستخدم TTT"}</h3>
                      </div>
                      <p className="whitespace-pre-line text-xs text-slate-800">{post.content}</p>
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