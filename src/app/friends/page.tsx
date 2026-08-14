"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Search, UserCheck, UserPlus, UserX, UserMinus, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
}

export default function FriendsPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState("مستخدم");
  const [currentUserAvatar, setCurrentUserAvatar] = useState("U");

  // التبويب النشط (1. مقترحة 2. مرسلة 3. مستلمة 4. يتابعونك 5. تتابعهم)
  const [activeTab, setActiveTab] = useState<"suggested" | "sent" | "received" | "followers" | "following">("suggested");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // قوائم البيانات الفعلية من الداتابيز
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]); // receiver_ids
  const [receivedRequests, setReceivedRequests] = useState<{ id: string; sender_id: string }[]>([]);
  const [friendsList, setFriendsList] = useState<string[]>([]);
  const [hiddenUsers, setHiddenUsers] = useState<string[]>([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [followersList, setFollowersList] = useState<string[]>([]);

  // تحميل البيانات الحقيقية
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push("/login");
      return;
    }

    const uid = session.user.id;
    setCurrentUserId(uid);
    const meta = session.user.user_metadata;
    setCurrentUserName(meta?.full_name || meta?.first_name || "مستخدم TTT");
    setCurrentUserAvatar((meta?.full_name || meta?.first_name || "U").charAt(0).toUpperCase());

    // 1. جلب كل العلاقات
    const { data: relations } = await supabase.from("friendships").select("*");

    const sent: string[] = [];
    const received: { id: string; sender_id: string }[] = [];
    const friends: string[] = [];
    const following: string[] = [];
    const followers: string[] = [];
    const rejected: string[] = [];

    (relations || []).forEach((rel) => {
      if (rel.sender_id === uid && rel.status === "pending") sent.push(rel.receiver_id);
      if (rel.receiver_id === uid && rel.status === "pending") received.push({ id: rel.id, sender_id: rel.sender_id });
      if ((rel.sender_id === uid || rel.receiver_id === uid) && rel.status === "accepted") {
        friends.push(rel.sender_id === uid ? rel.receiver_id : rel.sender_id);
      }
      if (rel.sender_id === uid && rel.status === "following") following.push(rel.receiver_id);
      if (rel.receiver_id === uid && rel.status === "following") followers.push(rel.sender_id);
      if ((rel.sender_id === uid || rel.receiver_id === uid) && rel.status === "rejected") {
        rejected.push(rel.sender_id === uid ? rel.receiver_id : rel.sender_id);
      }
    });

    setSentRequests(sent);
    setReceivedRequests(received);
    setFriendsList(friends);
    setFollowingList(following);
    setFollowersList(followers);
    setHiddenUsers(rejected);

    // 2. جلب المنشورات لاستخراج المستخدمين الحقيقيين المسجلين في الموقع
    const { data: postsData } = await supabase.from("posts").select("user_id, author_name, author_avatar");
    const userMap = new Map<string, UserProfile>();

    (postsData || []).forEach((p) => {
      if (p.user_id && p.user_id !== uid && !userMap.has(p.user_id)) {
        userMap.set(p.user_id, {
          id: p.user_id,
          name: p.author_name || "مستخدم TTT",
          avatar: p.author_avatar || "U",
        });
      }
    });

    setAllUsers(Array.from(userMap.values()));
    setLoading(false);
  };

  // 1️⃣ إرسال طلب صداقة + إنشاء إشعار فوري
  const handleSendRequest = async (targetUser: UserProfile) => {
    if (!currentUserId) return;

    setSentRequests([...sentRequests, targetUser.id]);

    await supabase.from("friendships").upsert({
      sender_id: currentUserId,
      receiver_id: targetUser.id,
      status: "pending",
    });

    // توليد إشعار للمستلم
    await supabase.from("notifications").insert({
      user_id: targetUser.id,
      sender_id: currentUserId,
      sender_name: currentUserName,
      sender_avatar: currentUserAvatar,
      type: "friend_request",
      content: `أرسل لك طلب صداقة جديد.`,
      is_read: false,
    });
  };

  // 2️⃣ إلغاء طلب مرسل
  const handleCancelSentRequest = async (targetUserId: string) => {
    if (!currentUserId) return;
    setSentRequests(sentRequests.filter((id) => id !== targetUserId));

    await supabase
      .from("friendships")
      .delete()
      .match({ sender_id: currentUserId, receiver_id: targetUserId, status: "pending" });
  };

  // 3️⃣ قبول طلب صداقة مستلم
  const handleAcceptRequest = async (targetUser: UserProfile) => {
    if (!currentUserId) return;

    setReceivedRequests(receivedRequests.filter((r) => r.sender_id !== targetUser.id));
    setFriendsList([...friendsList, targetUser.id]);

    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .match({ sender_id: targetUser.id, receiver_id: currentUserId });

    // توليد إشعار قبول للصديق
    await supabase.from("notifications").insert({
      user_id: targetUser.id,
      sender_id: currentUserId,
      sender_name: currentUserName,
      sender_avatar: currentUserAvatar,
      type: "friend_accept",
      content: `وافق على طلب الصداقة الخاص بك، أنتم الآن أصدقاء! 🎉`,
      is_read: false,
    });
  };

  // 4️⃣ رفض الطلب أو حذف المستخدم نهائياً
  const handleRejectOrHide = async (targetUserId: string) => {
    if (!currentUserId) return;

    setHiddenUsers([...hiddenUsers, targetUserId]);
    setReceivedRequests(receivedRequests.filter((r) => r.sender_id !== targetUserId));

    await supabase
      .from("friendships")
      .upsert({
        sender_id: currentUserId,
        receiver_id: targetUserId,
        status: "rejected",
      });
  };

  // 5️⃣ تبديل المتابعة (Follow / Unfollow)
  const handleToggleFollow = async (targetUser: UserProfile) => {
    if (!currentUserId) return;

    const isFollowing = followingList.includes(targetUser.id);
    if (isFollowing) {
      setFollowingList(followingList.filter((id) => id !== targetUser.id));
      await supabase
        .from("friendships")
        .delete()
        .match({ sender_id: currentUserId, receiver_id: targetUser.id, status: "following" });
    } else {
      setFollowingList([...followingList, targetUser.id]);
      await supabase.from("friendships").upsert({
        sender_id: currentUserId,
        receiver_id: targetUser.id,
        status: "following",
      });

      // إشعار المتابعة
      await supabase.from("notifications").insert({
        user_id: targetUser.id,
        sender_id: currentUserId,
        sender_name: currentUserName,
        sender_avatar: currentUserAvatar,
        type: "new_follower",
        content: `بدأ بمتابعتك الآن.`,
        is_read: false,
      });
    }
  };

  // تصفية المستخدمين للتبويبات
  const getFilteredUsers = () => {
    let list: UserProfile[] = [];

    if (activeTab === "suggested") {
      list = allUsers.filter(
        (u) =>
          !sentRequests.includes(u.id) &&
          !receivedRequests.some((r) => r.sender_id === u.id) &&
          !friendsList.includes(u.id) &&
          !hiddenUsers.includes(u.id)
      );
    } else if (activeTab === "sent") {
      list = allUsers.filter((u) => sentRequests.includes(u.id));
    } else if (activeTab === "received") {
      list = allUsers.filter((u) => receivedRequests.some((r) => r.sender_id === u.id));
    } else if (activeTab === "following") {
      list = allUsers.filter((u) => followingList.includes(u.id));
    } else if (activeTab === "followers") {
      list = allUsers.filter((u) => followersList.includes(u.id));
    }

    if (searchQuery.trim()) {
      list = list.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return list;
  };

  const displayedUsers = getFilteredUsers();

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 dir-rtl font-sans select-none pb-20">
      
      {/* 🟢 الهيدر العلوي */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-black text-slate-900 tracking-wide">الأصدقاء</h1>
        </div>

        <div className="relative flex-1 max-w-[200px] mr-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-1.5 px-3 pr-8 text-xs font-bold focus:outline-none focus:border-orange-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
        </div>
      </header>

      {/* 🟢 التبويبات بالترتيب الدقيق من اليمين للشمال مع العداد الفعلي من قاعدة البيانات */}
      <div className="bg-white border-b border-slate-100 px-2 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        
        {/* 1. مقترحة */}
        <button
          onClick={() => setActiveTab("suggested")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition ${
            activeTab === "suggested" ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          مقترحة
        </button>

        {/* 2. المرسلة */}
        <button
          onClick={() => setActiveTab("sent")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
            activeTab === "sent" ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>المرسلة</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "sent" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}>
            {sentRequests.length}
          </span>
        </button>

        {/* 3. المستلمة */}
        <button
          onClick={() => setActiveTab("received")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
            activeTab === "received" ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>المستلمة</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "received" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}>
            {receivedRequests.length}
          </span>
        </button>

        {/* 4. يتابعونك */}
        <button
          onClick={() => setActiveTab("followers")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
            activeTab === "followers" ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>يتابعونك</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "followers" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}>
            {followersList.length}
          </span>
        </button>

        {/* 5. تتابعهم */}
        <button
          onClick={() => setActiveTab("following")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
            activeTab === "following" ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>تتابعهم</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "following" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}>
            {followingList.length}
          </span>
        </button>

      </div>

      {/* 🟢 قائمة المستخدمين تحت كل تبويب */}
      <main className="p-4 max-w-lg mx-auto space-y-3">
        {loading ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center flex justify-center items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            <span className="text-xs font-bold text-slate-500">جاري التحميل...</span>
          </div>
        ) : displayedUsers.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center space-y-1 shadow-sm">
            <p className="text-xs font-bold text-slate-500">لا يوجد مستخدمين في هذا القسم حالياً</p>
          </div>
        ) : (
          displayedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition hover:border-orange-200"
            >
              {/* صورة واسم المستخدم */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm border-2 border-orange-500 shadow-sm">
                  {user.avatar}
                </div>
                <div className="text-right">
                  <h3 className="font-black text-xs text-slate-900">{user.name}</h3>
                  <span className="text-[10px] font-bold text-slate-400 dir-ltr block">#{user.id.slice(0, 8)}</span>
                </div>
              </div>

              {/* الأزرار المخصصة لكل تبويب */}
              <div className="flex items-center gap-1.5">
                
                {/* 1️⃣ أزرار المقترحة (إرسال طلب + حذف) */}
                {activeTab === "suggested" && (
                  <>
                    <button
                      onClick={() => handleSendRequest(user)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm shadow-orange-500/20"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>إضافة</span>
                    </button>
                    <button
                      onClick={() => handleRejectOrHide(user.id)}
                      className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-xl transition"
                    >
                      حذف
                    </button>
                  </>
                )}

                {/* 2️⃣ أزرار الطلبات المرسلة (إلغاء الطلب) */}
                {activeTab === "sent" && (
                  <button
                    onClick={() => handleCancelSentRequest(user.id)}
                    className="bg-slate-100 hover:bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>إلغاء الطلب</span>
                  </button>
                )}

                {/* 3️⃣ أزرار الطلبات المستلمة (قبول + رفض) */}
                {activeTab === "received" && (
                  <>
                    <button
                      onClick={() => handleAcceptRequest(user)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm shadow-orange-500/20"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>قبول</span>
                    </button>
                    <button
                      onClick={() => handleRejectOrHide(user.id)}
                      className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-xl transition"
                    >
                      رفض
                    </button>
                  </>
                )}

                {/* 4️⃣ أزرار تتابعهم (إلغاء المتابعة) */}
                {activeTab === "following" && (
                  <button
                    onClick={() => handleToggleFollow(user)}
                    className="bg-slate-100 hover:bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>إلغاء المتابعة</span>
                  </button>
                )}

                {/* 5️⃣ يتابعونك: بدون أزرار، عرض فقط */}
                {activeTab === "followers" && (
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-xl">
                    متابع لك
                  </span>
                )}

              </div>
            </div>
          ))
        )}
      </main>

    </div>
  );
}