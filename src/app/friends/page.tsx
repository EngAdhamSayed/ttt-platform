"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Search, UserCheck, UserPlus, UserX, UserMinus, Loader2, BadgeCheck } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  user_number_id: string;
  is_verified: boolean;
}

export default function FriendsPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"suggested" | "sent" | "received" | "followers" | "following">("suggested");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // قوائم البيانات
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<string[]>([]);
  const [friendsList, setFriendsList] = useState<string[]>([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [followersList, setFollowersList] = useState<string[]>([]);
  const [hiddenUsers, setHiddenUsers] = useState<string[]>([]);

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push("/login");
      return;
    }

    const uid = session.user.id;
    setCurrentUserId(uid);

    // 1. جلب جميع البروفايلات المسجلة ما عدا المستخدم الحالي
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", uid);

    if (profiles) setAllProfiles(profiles);

    // 2. جلب جميع العلاقات
    const { data: relations } = await supabase.from("friendships").select("*");

    const sent: string[] = [];
    const received: string[] = [];
    const friends: string[] = [];
    const following: string[] = [];
    const followers: string[] = [];
    const rejected: string[] = [];

    (relations || []).forEach((rel) => {
      if (rel.sender_id === uid && rel.status === "pending") sent.push(rel.receiver_id);
      if (rel.receiver_id === uid && rel.status === "pending") received.push(rel.sender_id);
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

    setLoading(false);
  };

  // إرسال طلب صداقة
  const handleSendRequest = async (targetUser: Profile) => {
    if (!currentUserId) return;

    setSentRequests([...sentRequests, targetUser.id]);

    await supabase.from("friendships").upsert({
      sender_id: currentUserId,
      receiver_id: targetUser.id,
      status: "pending",
    });

    await supabase.from("notifications").insert({
      user_id: targetUser.id,
      actor_id: currentUserId,
      type: "friend_request",
      content: "أرسل لك طلب صداقة جديد.",
      entity_id: currentUserId,
    });
  };

  // إلغاء طلب مرسل
  const handleCancelSentRequest = async (targetUserId: string) => {
    if (!currentUserId) return;
    setSentRequests(sentRequests.filter((id) => id !== targetUserId));

    await supabase
      .from("friendships")
      .delete()
      .match({ sender_id: currentUserId, receiver_id: targetUserId, status: "pending" });
  };

  // قبول طلب صداقة
  const handleAcceptRequest = async (targetUser: Profile) => {
    if (!currentUserId) return;

    setReceivedRequests(receivedRequests.filter((id) => id !== targetUser.id));
    setFriendsList([...friendsList, targetUser.id]);

    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .match({ sender_id: targetUser.id, receiver_id: currentUserId });

    await supabase.from("notifications").insert({
      user_id: targetUser.id,
      actor_id: currentUserId,
      type: "friend_accept",
      content: "وافق على طلب الصداقة، أنتم الآن أصدقاء! 🎉",
      entity_id: currentUserId,
    });
  };

  // رفض أو إخفاء مستخدم
  const handleRejectOrHide = async (targetUserId: string) => {
    if (!currentUserId) return;

    setHiddenUsers([...hiddenUsers, targetUserId]);
    setReceivedRequests(receivedRequests.filter((id) => id !== targetUserId));

    await supabase.from("friendships").upsert({
      sender_id: currentUserId,
      receiver_id: targetUserId,
      status: "rejected",
    });
  };

  // متابعة / إلغاء متابعة
  const handleToggleFollow = async (targetUser: Profile) => {
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

      await supabase.from("notifications").insert({
        user_id: targetUser.id,
        actor_id: currentUserId,
        type: "new_follower",
        content: "بدأ بمتابعتك الآن.",
        entity_id: currentUserId,
      });
    }
  };

  const getFilteredUsers = () => {
    let list: Profile[] = [];

    if (activeTab === "suggested") {
      list = allProfiles.filter(
        (u) =>
          !sentRequests.includes(u.id) &&
          !receivedRequests.includes(u.id) &&
          !friendsList.includes(u.id) &&
          !hiddenUsers.includes(u.id)
      );
    } else if (activeTab === "sent") {
      list = allProfiles.filter((u) => sentRequests.includes(u.id));
    } else if (activeTab === "received") {
      list = allProfiles.filter((u) => receivedRequests.includes(u.id));
    } else if (activeTab === "following") {
      list = allProfiles.filter((u) => followingList.includes(u.id));
    } else if (activeTab === "followers") {
      list = allProfiles.filter((u) => followersList.includes(u.id));
    }

    if (searchQuery.trim()) {
      list = list.filter((u) => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return list;
  };

  const displayedUsers = getFilteredUsers();

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 dir-rtl font-sans select-none pb-20">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-black text-slate-900 tracking-wide">الأصدقاء</h1>

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

      {/* التبويبات بالترتيب الدقيق من اليمين لليسار */}
      <div className="bg-white border-b border-slate-100 px-2 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("suggested")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition ${
            activeTab === "suggested" ? "bg-orange-500 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          مقترحة
        </button>

        <button
          onClick={() => setActiveTab("sent")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
            activeTab === "sent" ? "bg-orange-500 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>المرسلة</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "sent" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}>
            {sentRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("received")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
            activeTab === "received" ? "bg-orange-500 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>المستلمة</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "received" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}>
            {receivedRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("followers")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
            activeTab === "followers" ? "bg-orange-500 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>يتابعونك</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "followers" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}>
            {followersList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("following")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
            activeTab === "following" ? "bg-orange-500 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>تتابعهم</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "following" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}>
            {followingList.length}
          </span>
        </button>
      </div>

      {/* قائمة الحسابات */}
      <main className="p-4 max-w-lg mx-auto space-y-3">
        {loading ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center flex justify-center items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            <span className="text-xs font-bold text-slate-500">جاري التحميل...</span>
          </div>
        ) : displayedUsers.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center space-y-1 shadow-sm">
            <p className="text-xs font-bold text-slate-500">لا يوجد مستخدمين في هذا القسم</p>
          </div>
        ) : (
          displayedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition hover:border-orange-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm border-2 border-orange-500 shadow-sm">
                  {user.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <h3 className="font-black text-xs text-slate-900">{user.full_name || "مستخدم"}</h3>
                    {user.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dir-ltr block">#{user.user_number_id}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {activeTab === "suggested" && (
                  <>
                    <button
                      onClick={() => handleSendRequest(user)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm"
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

                {activeTab === "sent" && (
                  <button
                    onClick={() => handleCancelSentRequest(user.id)}
                    className="bg-slate-100 hover:bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>إلغاء الطلب</span>
                  </button>
                )}

                {activeTab === "received" && (
                  <>
                    <button
                      onClick={() => handleAcceptRequest(user)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm"
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

                {activeTab === "following" && (
                  <button
                    onClick={() => handleToggleFollow(user)}
                    className="bg-slate-100 hover:bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>إلغاء المتابعة</span>
                  </button>
                )}

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