"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Heart, MessageCircle, Share2, Loader2, Plus } from "lucide-react";

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("stories")
      .select(`id, media_url, caption, created_at, profiles:user_id(full_name, avatar_url)`)
      .order("created_at", { ascending: false });

    if (data) setReels(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20 dir-rtl font-sans">
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      ) : reels.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-3">
          <p className="text-xs text-slate-400">لا توجد فيديوهات ريلز أو قصص مصورة حالياً</p>
          <button className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>إضافة أول ريل</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-md mx-auto">
          {reels.map((reel) => (
            <div key={reel.id} className="relative h-[80vh] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 flex flex-col justify-end p-4">
              <video src={reel.media_url} className="absolute inset-0 w-full h-full object-cover" controls loop />
              <div className="relative z-10 space-y-2 text-right bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 rounded-2xl">
                <h3 className="text-xs font-bold text-amber-400">{reel.profiles?.full_name || "مستخدم TTT"}</h3>
                <p className="text-xs text-slate-200">{reel.caption}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}