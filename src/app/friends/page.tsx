"use client";

import React from "react";
import { Search, UserPlus, UserX } from "lucide-react";

export default function FriendsPage() {
  const friendRequests = [
    { id: 1, name: "Mohamed Haseen", time: "2d", mutual: "1 صديق مشترك", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
    { id: 2, name: "Abd Elrahman Bakr", time: "3d", mutual: "3 أصدقاء مشتركون", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" }
  ];

  const suggestions = [
    { id: 101, name: "شهد كمال", mutual: "2 أصدقاء مشتركون", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
    { id: 102, name: "Marwan Mohamed", mutual: "2 أصدقاء مشتركون", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150" },
    { id: 103, name: "Mariam Gamal", mutual: "4 أصدقاء مشتركون", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" }
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-24 dir-rtl font-sans">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-black text-slate-900">الأصدقاء</h1>
        <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700">
          <Search className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">

        {/* Friend Requests Section */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">
              طلبات الصداقة <span className="text-rose-500 font-extrabold">{friendRequests.length}</span>
            </h2>
            <button className="text-xs text-blue-600 font-bold hover:underline">عرض الكل</button>
          </div>

          <div className="space-y-3">
            {friendRequests.map((req) => (
              <div key={req.id} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
                <img src={req.avatar} alt={req.name} className="w-14 h-14 rounded-full object-cover border border-slate-100" />
                <div className="flex-1 text-right space-y-1.5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-900">{req.name}</h3>
                    <span className="text-[10px] text-slate-400 font-medium">{req.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{req.mutual}</p>
                  
                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 bg-blue-600 text-white font-bold py-1.5 rounded-xl text-xs hover:bg-blue-700 transition">
                      تأكيد
                    </button>
                    <button className="flex-1 bg-slate-200 text-slate-700 font-bold py-1.5 rounded-xl text-xs hover:bg-slate-300 transition">
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* People You May Know Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 text-right">أشخاص قد تعرفهم</h2>

          <div className="space-y-3">
            {suggestions.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
                <img src={item.avatar} alt={item.name} className="w-14 h-14 rounded-full object-cover border border-slate-100" />
                <div className="flex-1 text-right space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-900">{item.name}</h3>
                  <p className="text-[10px] text-slate-500">{item.mutual}</p>
                  
                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 bg-blue-50 text-blue-600 font-bold py-1.5 rounded-xl text-xs hover:bg-blue-100 transition flex items-center justify-center gap-1">
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>إضافة صديق</span>
                    </button>
                    <button className="flex-1 bg-slate-100 text-slate-600 font-semibold py-1.5 rounded-xl text-xs hover:bg-slate-200 transition">
                      إزالة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

    </div>
  );
}