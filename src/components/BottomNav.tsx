"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Home, Film, UserCheck, Compass, Bell, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadNotifications();

    // استماع لحظي لتحديث العداد فور وصول إشعار جديد
    const channel = supabase
      .channel("bottomnav-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          fetchUnreadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUnreadNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false);

      setUnreadCount(count || 0);
    }
  };

  // إخفاء الشريط في صفحات تسجيل الدخول وإنشاء الحساب
  if (pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password") {
    return null;
  }

  const navItems = [
    { name: "الرئيسية", href: "/", icon: Home },
    { name: "الريلز", href: "/reels", icon: Film },
    { name: "الأصدقاء", href: "/friends", icon: UserCheck },
    { name: "استكشف", href: "/explore", icon: Compass },
    { name: "الإشعارات", href: "/notifications", icon: Bell, badge: unreadCount },
    { name: "حسابي", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-2 px-3 flex justify-around items-center shadow-lg select-none dir-rtl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 relative transition-all duration-200 ${
              isActive ? "text-orange-600 font-black scale-105" : "text-slate-500 hover:text-slate-800 font-bold"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-orange-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {item.badge > 99 ? "+99" : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px]">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}