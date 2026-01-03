import { useState } from 'react';
import { motion } from 'framer-motion';
import { Inbox, Reply, Check, AlertCircle, HelpCircle, RotateCcw, MessageSquare } from 'lucide-react';
import { ManagerSidebar } from '@/components/ManagerSidebar';
import { MobileManagerNav } from '@/components/MobileManagerNav';
import { inquiries, Inquiry } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const typeIcons = {
  refund: RotateCcw,
  question: HelpCircle,
  complaint: AlertCircle,
};

const typeLabels = {
  refund: 'Refund',
  question: 'Question',
  complaint: 'Complaint',
};

const typeColors = {
  refund: 'from-warning to-amber-400',
  question: 'from-accent to-rose-400',
  complaint: 'from-destructive to-rose-500',
};

export default function ManagerInbox() {
  const [localInquiries, setLocalInquiries] = useState<Inquiry[]>(inquiries);

  const handleReply = (id: string) => {
    setLocalInquiries(prev =>
      prev.map(inq =>
        inq.id === id ? { ...inq, status: 'resolved' as const } : inq
      )
    );
    toast.success('Reply sent successfully');
  };

  const pendingCount = localInquiries.filter(i => i.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background flex">
      <ManagerSidebar />
      
      <main className="flex-1 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-gradient-hero p-6 pt-12 lg:pt-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Inbox className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Inbox</h1>
                  <p className="text-white/80">{pendingCount} pending inquiries</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-6">
          {localInquiries.length === 0 ? (
            <div className="card-elevated p-12 text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No inquiries</p>
            </div>
          ) : (
            <div className="space-y-4">
              {localInquiries.map((inquiry, index) => {
                const TypeIcon = typeIcons[inquiry.type];
                const formattedDate = format(new Date(inquiry.date), 'MMM d, yyyy');

                return (
                  <motion.div
                    key={inquiry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className={cn(
                      "card-elevated p-5 transition-all",
                      inquiry.status === 'pending' ? 'border-l-4 border-l-warning' : ''
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br",
                          inquiry.status === 'pending' ? typeColors[inquiry.type] : 'from-success to-teal-400',
                          'text-white'
                        )}>
                          {inquiry.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{inquiry.userName}</p>
                          <p className="text-xs text-muted-foreground">{formattedDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold",
                          inquiry.status === 'pending' 
                            ? 'bg-warning/15 text-warning' 
                            : 'bg-success/15 text-success'
                        )}>
                          {inquiry.status === 'pending' ? 'Pending' : 'Resolved'}
                        </span>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground flex items-center gap-1"
                        )}>
                          <TypeIcon className="w-3 h-3" />
                          {typeLabels[inquiry.type]}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-foreground mb-2">{inquiry.subject}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {inquiry.message}
                    </p>

                    {inquiry.status === 'pending' && (
                      <button
                        onClick={() => handleReply(inquiry.id)}
                        className="flex items-center gap-2 px-4 py-2 btn-primary-gradient text-sm"
                      >
                        <Reply className="w-4 h-4" />
                        Send Reply
                      </button>
                    )}

                    {inquiry.status === 'resolved' && (
                      <div className="flex items-center gap-2 text-sm text-success font-medium">
                        <Check className="w-4 h-4" />
                        Inquiry resolved
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <MobileManagerNav />
    </div>
  );
}
