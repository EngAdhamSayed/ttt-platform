"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Video, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "الرئيسية", href: "/", icon: Home },
    { name: "استكشف", href: "/explore", icon: Search },
    { name: "إنشاء", href: "#create", isPlus: true, icon: PlusCircle },
    { name: "ريلز", href: "/reels", icon: Video },
    { name: "حسابي", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 max-w-md mx-auto dir-rtl">
      <div className="flex items-center justify-around py-2 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isPlus) {
            return (
              <Link
                key={item.name}
                href="/"
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-full flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 border-4 border-slate-900 hover:scale-105 transition">
                  <PlusCircle className="w-7 h-7 stroke-[2.2]" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                isActive
                  ? "text-amber-400 font-bold scale-105"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              <div className={`p-1 rounded-xl ${isActive ? "bg-amber-400/10" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}