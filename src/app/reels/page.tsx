"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus } from "lucide-react";

interface ReelItem {
  id: string;
  media_url: string;
  caption: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function ReelsPage() {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchReels = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("stories")
        .select(`id, media_url, caption, created_at, profiles:user_id(full_name, avatar_url)`)
        .order("created_at", { ascending: false });

      if (active) {
        if (data) {
          const normalizedReels = data.map((item: Record<string, unknown>) => ({
            id: String(item.id),
            media_url: String(item.media_url ?? ""),
            caption: typeof item.caption === "string" ? item.caption : null,
            created_at: String(item.created_at ?? ""),
            profiles:
              item.profiles && typeof item.profiles === "object"
                ? {
                    full_name: typeof (item.profiles as { full_name?: unknown }).full_name === "string" ? (item.profiles as { full_name?: string }).full_name ?? null : null,
                    avatar_url: typeof (item.profiles as { avatar_url?: unknown }).avatar_url === "string" ? (item.profiles as { avatar_url?: string }).avatar_url ?? null : null,
                  }
                : null,
          }));
          setReels(normalizedReels as ReelItem[]);
        }
        setLoading(false);
      }
    };

    void fetchReels();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black pb-20 text-white dir-rtl font-sans">
      {loading ? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        </div>
      ) : reels.length === 0 ? (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-3 p-6 text-center">
          <p className="text-xs text-slate-400">لا توجد فيديوهات ريلز أو قصص مصورة حالياً</p>
          <button className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950">
            <Plus className="h-4 w-4" />
            <span>إضافة أول ريل</span>
          </button>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-4 p-3">
          {reels.map((reel) => (
            <div key={reel.id} className="relative flex h-[80vh] flex-col justify-end overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900 p-4">
              <video src={reel.media_url} className="absolute inset-0 h-full w-full object-cover" controls loop />
              <div className="relative z-10 space-y-2 rounded-[1.25rem] bg-linear-to-t from-black/80 via-black/30 to-transparent p-3 text-right">
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