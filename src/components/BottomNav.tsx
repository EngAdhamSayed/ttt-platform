"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Video, User } from "lucide-react";

interface BottomNavProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "الرئيسية", href: "/", id: "home", isPlus: false, icon: Home },
    { name: "استكشف", href: "/explore", id: "explore", isPlus: false, icon: Search },
    { name: "إنشاء", href: "#create", id: "create", isPlus: true, icon: PlusCircle },
    { name: "ريلز", href: "/reels", id: "reels", isPlus: false, icon: Video },
    { name: "حسابي", href: "/profile", id: "profile", isPlus: false, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 max-w-md mx-auto dir-rtl select-none shadow-lg">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || activeTab === item.id;

          if (item.isPlus) {
            return (
              <button
                key={item.name}
                onClick={() => {
                  const textarea = document.querySelector("textarea");
                  if (textarea) {
                    textarea.focus();
                    textarea.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                className="flex flex-col items-center justify-center -mt-6 group"
              >
                <div className="w-12 h-12 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center text-white shadow-md border-4 border-white transition-all duration-200">
                  <PlusCircle className="w-7 h-7 stroke-[2.2]" />
                </div>
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all duration-200 relative py-1 px-3 rounded-xl ${
                isActive
                  ? "text-amber-600 font-bold"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive ? "bg-amber-50 text-amber-600" : ""
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span className="text-[10px] tracking-tight">{item.name}</span>

              {isActive && (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}