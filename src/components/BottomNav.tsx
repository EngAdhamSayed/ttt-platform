"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Video, User } from "lucide-react";

// إضافة الـ Props هنا بتخلي TypeScript يرضى على كل الصفحات القديمة والحديثة!
interface BottomNavProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "الرئيسية", href: "/", id: "home", isPlus: false, icon: Home },
    { name: "استكشف", href: "/explore", id: "explore", isPlus: false, icon: Search },
    { name: "إنشاء", href: "#create", id: "create", isPlus: true, icon: PlusCircle },
    { name: "ريلز", href: "/reels", id: "reels", isPlus: false, icon: Video },
    { name: "حسابي", href: "/profile", id: "profile", isPlus: false, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 max-w-md mx-auto dir-rtl select-none">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          // التحقق من الصفحة النشطة سواء بالمسار الحقيقي أو بالـ activeTab القديم
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
                <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 rounded-full flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 border-4 border-slate-950 group-hover:scale-110 group-active:scale-95 transition-all duration-200">
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
                  ? "text-amber-400 font-bold scale-105"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive ? "bg-amber-400/10 text-amber-400" : ""
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span className="text-[10px] tracking-tight">{item.name}</span>

              {isActive && (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-sm shadow-amber-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}