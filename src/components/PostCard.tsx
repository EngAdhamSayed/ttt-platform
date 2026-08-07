import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, SendHorizonal } from "lucide-react";

interface CommentData {
  id: string;
  author: string;
  text: string;
  created_at: string;
}

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    image_url?: string | null;
    likes_count?: number;
    liked_by_me?: boolean;
    comments?: CommentData[];
    profiles?: {
      full_name?: string | null;
      avatar_url?: string | null;
    } | null;
  };
  onToggleLike?: (postId: string) => void;
  onAddComment?: (postId: string, text: string) => void;
  currentUserName?: string | null;
}

const avatarFallback = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80";

export default function PostCard({ post, onToggleLike, onAddComment, currentUserName }: PostCardProps) {
  const [commentText, setCommentText] = useState("");

  const title = post.profiles?.full_name || "مستخدم TTT";
  const time = new Date(post.created_at).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment?.(post.id, commentText);
    setCommentText("");
  };

  return (
    <article className="space-y-2 rounded-3xl border border-slate-200 bg-white p-3 text-right shadow-sm">
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

      {post.image_url ? (
        <div className="overflow-hidden rounded-[1.25rem] border border-slate-200">
          <Image src={post.image_url} alt="Post image" width={900} height={560} unoptimized className="h-auto w-full object-cover" />
        </div>
      ) : null}

      <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/70 px-3 py-2 text-[11px] font-semibold text-slate-600">
        <div className="flex items-center gap-3">
          <button onClick={() => onToggleLike?.(post.id)} className={`flex items-center gap-1 transition ${post.liked_by_me ? "text-rose-600" : "text-slate-600"}`}>
            <Heart className={`h-3.5 w-3.5 ${post.liked_by_me ? "fill-rose-500 text-rose-500" : "text-rose-500"}`} />
            {post.likes_count ?? 0}
          </button>
          <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5 text-orange-500" /> {post.comments?.length ?? 0}</span>
        </div>
        <span className="flex items-center gap-1"><Share2 className="h-3.5 w-3.5 text-amber-600" /> مشاركة</span>
      </div>

      {(post.comments?.length ?? 0) > 0 ? (
        <div className="space-y-1 rounded-2xl bg-slate-50 p-2">
          {post.comments?.slice(-2).map((comment) => (
            <div key={comment.id} className="rounded-xl bg-white px-2.5 py-1.5 text-[11px] text-slate-700">
              <span className="font-bold text-slate-900">{comment.author}</span>: {comment.text}
            </div>
          ))}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2">
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={`اكتب تعليقًا كـ ${currentUserName || "مستخدم"}`}
          className="flex-1 bg-transparent px-1 text-right text-xs text-slate-700 outline-none"
        />
        <button type="submit" className="rounded-full bg-orange-600 p-2 text-white">
          <SendHorizonal className="h-3.5 w-3.5" />
        </button>
      </form>
    </article>
  );
}
