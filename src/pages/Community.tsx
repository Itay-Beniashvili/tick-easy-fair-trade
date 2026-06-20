import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Car, UserPlus, MessageSquarePlus, Send } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { listPosts, createPost } from '@/api/community';
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
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<PostType>('partner');
  const [content, setContent] = useState('');
  const [userName, setUserName] = useState('You');

  const load = async () => {
    setLoading(true);
    try {
      setPosts(await listPosts());
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-hero pt-12 pb-6 px-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Community</h1>
            <p className="text-white/80 text-sm">Find partners & rides for events</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
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
                  <p className="text-sm text-foreground">{post.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">— {post.user_name}</p>
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
