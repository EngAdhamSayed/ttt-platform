"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Film, Heart, MessageCircle, Share2 } from "lucide-react";

interface ReelItem {
  id: string;
  media_url: string;
  caption: string | null;
  profiles: { full_name: string | null; user_number_id: string | null } | null;
}

export default function ReelsPage() {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchReels = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("stories").select(`id, media_url, caption, profiles:user_id(full_name, user_number_id)`).gt("expires_at", new Date().toISOString());
    if (data) setReels(data as unknown as ReelItem[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchReels(); }, [fetchReels]);

  return (
    <div className="min-h-screen bg-black text-white pb-24 dir-rtl font-sans flex flex-col items-center justify-center relative">
      <header className="fixed top-0 inset-x-0 z-40 bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center max-w-md mx-auto w-full">
        <h1 className="text-base font-black text-orange-500 flex items-center gap-2"><Film className="w-5 h-5" /><span>الريلز</span></h1>
      </header>

      <main className="w-full max-w-md h-screen flex flex-col items-center justify-center p-2 pt-16">
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        ) : reels.length === 0 ? (
          <div className="text-center text-slate-400 text-xs space-y-2"><Film className="w-10 h-10 mx-auto text-slate-600" /><p>لا توجد فيديوهات ريلز مجهزة حالياً.</p></div>
        ) : (
          reels.map((reel) => (
            <div key={reel.id} className="relative w-full h-[80vh] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
              <img src={reel.media_url} alt="Reel" className="w-full h-full object-cover" />
              <div className="absolute bottom-4 right-4 left-16 text-right">
                <h3 className="text-xs font-bold text-white">{reel.profiles?.full_name}</h3>
                <p className="text-xs text-slate-200">{reel.caption}</p>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}