import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Car, UserPlus, MessageSquarePlus, Send, MessageCircle } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { listPosts, listReplies, createPost, createReply } from '@/api/community';
import { getProfile } from '@/api/profile';
import type { CommunityPostRow } from '@/api/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type PostType = 'partner' | 'ride' | 'other';

const typeMeta: Record<PostType, { label: string; icon: typeof Users }> = {
  partner: { label: 'Looking for a partner', icon: UserPlus },
  ride: { label: 'Ride / carpool', icon: Car },
  other: { label: 'General', icon: Users },
};

export default function Community() {
  const [posts, setPosts] = useState<CommunityPostRow[]>([]);
  const [replies, setReplies] = useState<Record<string, CommunityPostRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<PostType>('partner');
  const [content, setContent] = useState('');
  const [userName, setUserName] = useState('You');
  const [openReplyFor, setOpenReplyFor] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replySubmitting, setReplySubmitting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const topLevel = await listPosts();
      setPosts(topLevel);
      const flatReplies = await listReplies(topLevel.map((p) => p.id));
      const grouped: Record<string, CommunityPostRow[]> = {};
      for (const r of flatReplies) {
        const key = r.parent_post_id as string;
        (grouped[key] ??= []).push(r);
      }
      setReplies(grouped);
      const p = await getProfile();
      if (p?.full_name) setUserName(p.full_name);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!content.trim()) return;
    try {
      await createPost(null, type, content.trim(), userName);
      setContent('');
      toast.success('Posted to the community');
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const submitReply = async (postId: string) => {
    const draft = (replyDrafts[postId] ?? '').trim();
    if (!draft) return;
    setReplySubmitting(postId);
    try {
      await createReply(postId, draft, userName);
      setReplyDrafts((d) => ({ ...d, [postId]: '' }));
      setOpenReplyFor(null);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setReplySubmitting(null);
    }
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-10 lg:pt-16">
      <div className="bg-gradient-hero pt-12 pb-6 px-4 lg:px-8">
        <div className="max-w-lg lg:max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-4xl text-white">Going <span className="font-serif-accent font-normal">together.</span></h1>
            <p className="text-white/80 text-sm">Find partners & rides for events</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg lg:max-w-3xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* New post */}
        <div className="card-elevated p-4 space-y-3">
          <div className="flex gap-2">
            {(Object.keys(typeMeta) as PostType[]).map((t) => {
              const Icon = typeMeta[t].icon;
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                    type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {typeMeta[t].label}
                </button>
              );
            })}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you looking for?"
            className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={3}
          />
          <button
            onClick={submit}
            disabled={!content.trim()}
            className="w-full btn-primary-gradient py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Post
          </button>
        </div>

        {/* Feed */}
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading…</p>
        ) : posts.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <MessageSquarePlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No community posts yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => {
              const meta = typeMeta[(post.type as PostType)] ?? typeMeta.other;
              const Icon = meta.icon;
              const postReplies = replies[post.id] ?? [];
              const isOpen = openReplyFor === post.id;
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-elevated p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      <Icon className="w-3 h-3" /> {meta.label}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(post.created_at), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground break-words">{post.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="flex-1 min-w-0 truncate text-xs text-muted-foreground">— {post.user_name}</p>
                    <button
                      onClick={() => setOpenReplyFor(isOpen ? null : post.id)}
                      className="inline-flex flex-shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Reply
                      {postReplies.length > 0 && <span>({postReplies.length})</span>}
                    </button>
                  </div>

                  {postReplies.length > 0 && (
                    <div className="mt-3 space-y-2.5">
                      {postReplies.map((reply) => (
                        <div
                          key={reply.id}
                          className="border-l-2 border-primary/20 pl-3 min-w-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="min-w-0 truncate text-xs font-semibold text-foreground">{reply.user_name}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {format(new Date(reply.created_at), 'MMM d, HH:mm')}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/90 break-words mt-0.5">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {isOpen && (
                    <div className="mt-3 border-l-2 border-primary/20 pl-3 space-y-2">
                      <textarea
                        value={replyDrafts[post.id] ?? ''}
                        onChange={(e) => setReplyDrafts((d) => ({ ...d, [post.id]: e.target.value }))}
                        placeholder="Write a reply…"
                        className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                        rows={2}
                      />
                      <button
                        onClick={() => submitReply(post.id)}
                        disabled={!(replyDrafts[post.id] ?? '').trim() || replySubmitting === post.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" /> Send
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
