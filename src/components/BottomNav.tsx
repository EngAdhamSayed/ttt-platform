"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Tv2, Users, UsersRound, Bell, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "الرئيسية", href: "/", icon: Home },
    { name: "ريلز", href: "/reels", icon: Tv2 },
    { name: "الأصدقاء", href: "/friends", icon: Users },
    { name: "المجموعات", href: "/groups", icon: UsersRound },
    { name: "الإشعارات", href: "/notifications", icon: Bell },
    { name: "حسابي", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 max-w-5xl mx-auto dir-rtl select-none shadow-[0_-8px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center rounded-2xl py-1.5 transition-all ${
                isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <Icon className={`h-6 w-6 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-blue-600" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}