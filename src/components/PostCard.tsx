import Image from "next/image";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    profiles?: {
      full_name?: string | null;
      avatar_url?: string | null;
    } | null;
  };
}

const avatarFallback = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80";

export default function PostCard({ post }: PostCardProps) {
  const title = post.profiles?.full_name || "مستخدم TTT";
  const time = new Date(post.created_at).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="space-y-2 rounded-[1.5rem] border border-slate-200 bg-white p-3 text-right shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            <Image src={post.profiles?.avatar_url || avatarFallback} alt="Avatar" fill unoptimized className="object-cover" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">{title}</h3>
            <span className="text-[10px] text-slate-400">{time}</span>
          </div>
        </div>
        <button className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <p className="whitespace-pre-line text-xs leading-6 text-slate-800">{post.content}</p>

      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-rose-500" /> 124</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5 text-blue-500" /> 18</span>
        </div>
        <span className="flex items-center gap-1"><Share2 className="h-3.5 w-3.5 text-emerald-600" /> مشاركة</span>
      </div>
    </article>
  );
}
