"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Video, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "الرئيسية", href: "/", isPlus: false, icon: Home },
    { name: "استكشف", href: "/explore", isPlus: false, icon: Search },
    { name: "إنشاء", href: "#create", isPlus: true, icon: PlusCircle },
    { name: "ريلز", href: "/reels", isPlus: false, icon: Video },
    { name: "حسابي", href: "/profile", isPlus: false, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 max-w-md mx-auto dir-rtl select-none">
      <div className="flex items-center justify-around py-2 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          // زر الإنشاء الرئيسي (+) المرتفع في المنتصف
          if (item.isPlus) {
            return (
              <Link
                key={item.name}
                href="/"
                onClick={(e) => {
                  // التركيز على مربع كتابة المنشور فوق في الصفحة الرئيسية
                  const textarea = document.querySelector("textarea");
                  if (textarea) {
                    textarea.focus();
                    textarea.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                className="flex flex-col items-center justify-center -mt-6 group"
              >
                <div className="w-13 h-13 bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 rounded-full flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 border-4 border-slate-950 group-hover:scale-110 group-active:scale-95 transition-all duration-200">
                  <PlusCircle className="w-7 h-7 stroke-[2.2]" />
                </div>
              </Link>
            );
          }

          // بقية الأيقونات (الرئيسية، استكشف، ريلز، حسابي)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all duration-200 relative py-1 px-2.5 rounded-xl ${
                isActive
                  ? "text-amber-400 font-bold scale-105"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive ? "bg-amber-400/10 text-amber-400 shadow-inner" : ""
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span className="text-[10px] tracking-tight">{item.name}</span>

              {/* مؤشر النقطة المضيئة أسفل الأيقونة النشطة */}
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-sm shadow-amber-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}