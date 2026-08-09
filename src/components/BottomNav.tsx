"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Film, Users, UsersRound, Bell, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  // إخفاء الشريط تماماً من صفحات الدخول والتسجيل وإعادة التعيين
  const isAuthPage = 
    pathname === "/login" || 
    pathname === "/signup" || 
    pathname === "/forgot-password";

  if (isAuthPage) return null;

  const navItems = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/reels", label: "الريلز", icon: Film },
    { href: "/friends", label: "الأصدقاء", icon: Users },
    { href: "/groups", label: "المجموعات", icon: UsersRound },
    { href: "/notifications", label: "الإشعارات", icon: Bell },
    { href: "/profile", label: "حسابي", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 max-w-md mx-auto py-2 px-3 flex justify-around items-center text-slate-400 font-sans dir-rtl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-all duration-200 ${
              isActive 
                ? "text-orange-500 font-black scale-105" 
                : "hover:text-slate-600"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
            <span className="text-[10px] leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}