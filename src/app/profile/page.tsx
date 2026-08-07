"use client";

import React, { useState } from "react";
import {
  Camera,
  Plus,
  Edit3,
  MapPin,
  Home,
  Calendar,
  Heart,
  GraduationCap,
  MoreHorizontal,
  Users,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"all" | "photos" | "reels">("all");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-24 dir-rtl font-sans">
      
      {/* Cover Image & Profile Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="relative h-44 bg-slate-300">
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800" 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <button className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md p-2 rounded-full shadow hover:bg-white text-slate-700">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Avatar & Info Section */}
        <div className="px-4 pb-4 relative">
          <div className="flex justify-between items-end -mt-14 mb-3">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-slate-200 shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400" 
                  alt="Adham Sayed" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-1 right-1 bg-slate-100 border border-slate-300 p-1.5 rounded-full text-slate-700 shadow-sm">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <button className="p-2 bg-slate-100 rounded-full border border-slate-200 text-slate-700">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1 text-right">
            <h1 className="text-xl font-bold text-slate-900">Adham Sayed</h1>
            <p className="text-xs text-slate-500 font-medium">55 أصدقاء • 6 منشورات</p>
            <p className="text-xs text-slate-700 italic font-serif pt-1">you can jus try ✨</p>
            <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
              <span>Single</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              <span>إضافة إلى القصة</span>
            </button>
            <button className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5">
              <Edit3 className="w-4 h-4" />
              <span>تعديل الملف الشخصي</span>
            </button>
          </div>
        </div>

        {/* Profile Navigation Tabs */}
        <div className="flex border-t border-slate-100 px-4 pt-2">
          <button 
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2 text-xs font-bold border-b-2 text-center ${activeTab === "all" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
          >
            الكل
          </button>
          <button 
            onClick={() => setActiveTab("photos")}
            className={`flex-1 py-2 text-xs font-bold border-b-2 text-center ${activeTab === "photos" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
          >
            الصور
          </button>
          <button 
            onClick={() => setActiveTab("reels")}
            className={`flex-1 py-2 text-xs font-bold border-b-2 text-center ${activeTab === "reels" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
          >
            ريلز
          </button>
        </div>
      </div>

      {/* Details Box */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 text-right">التفاصيل الشخصية</h2>
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>

          <div className="space-y-2.5 text-xs text-slate-700 text-right font-medium">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>يقيم في <strong className="text-slate-900">الجيزة</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4 text-slate-400" />
              <span>من <strong className="text-slate-900">الجيزة</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>تاريخ الميلاد: <strong className="text-slate-900">8 نوفمبر 2005</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span>درس في <strong className="text-slate-900">معهد الجيزة العالي للهندسة والتكنولوجيا</strong></span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 text-right">إحصائياتك</h2>
            <Users className="h-4 w-4 text-slate-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-2">
              <p className="text-base font-black text-slate-900">55</p>
              <p>أصدقاء</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-2">
              <p className="text-base font-black text-slate-900">6</p>
              <p>منشورات</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-2">
              <p className="text-base font-black text-slate-900">12</p>
              <p>قصص</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}