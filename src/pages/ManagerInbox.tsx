import { useState } from 'react';
import { motion } from 'framer-motion';
import { Inbox, Reply, Check, AlertCircle, HelpCircle, RotateCcw, MessageSquare, Filter, Sparkles } from 'lucide-react';
import { ManagerSidebar } from '@/components/ManagerSidebar';
import { MobileManagerNav } from '@/components/MobileManagerNav';
import { inquiries, Inquiry, events } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const typeGradients = {
  refund: 'from-warning to-orange-400',
  question: 'from-primary to-violet-400',
  complaint: 'from-destructive to-red-400',
};

export default function ManagerInbox() {
  const [localInquiries, setLocalInquiries] = useState<Inquiry[]>(inquiries);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  const handleReply = (id: string) => {
    setLocalInquiries(prev =>
      prev.map(inq =>
        inq.id === id ? { ...inq, status: 'resolved' as const } : inq
      )
    );
    toast.success('Reply sent successfully');
  };

  const filteredInquiries = selectedEvent === 'all' 
    ? localInquiries 
    : localInquiries.filter(inq => inq.eventId === selectedEvent);

  const pendingCount = filteredInquiries.filter(i => i.status === 'pending').length;

  const getEventTitle = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event?.title || 'Unknown Event';
  };

  return (
    <div className="min-h-screen bg-background flex">
      <ManagerSidebar />
      
      <main className="flex-1 pb-20 lg:pb-0">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
          <div className="absolute inset-0 bg-mesh opacity-40" />
          
          <div className="relative p-6 pt-12 lg:pt-6">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-xl">
                    <Inbox className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Inbox</h1>
                    <p className="text-white/70 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {pendingCount} pending inquiries
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-6">
          {/* Event Filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 p-4 card-elevated">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Filter className="w-5 h-5 text-primary" />
              </div>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="flex-1 bg-muted border-0 h-12 rounded-xl">
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {filteredInquiries.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-elevated p-16 text-center"
            >
              <MessageSquare className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No inquiries {selectedEvent !== 'all' ? 'for this event' : ''}</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry, index) => {
                const TypeIcon = typeIcons[inquiry.type];
                const formattedDate = format(new Date(inquiry.date), 'MMM d, yyyy');

                return (
                  <motion.div
                    key={inquiry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    whileHover={{ scale: 1.01 }}
                    className={cn(
                      "card-elevated p-6 transition-all",
                      inquiry.status === 'pending' ? 'border-l-4 border-l-warning' : ''
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold bg-gradient-to-br shadow-lg",
                          inquiry.status === 'pending' ? typeGradients[inquiry.type] : 'from-success to-emerald-400',
                          'text-white'
                        )}>
                          {inquiry.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-lg">{inquiry.userName}</p>
                          <p className="text-sm text-muted-foreground">{formattedDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-bold",
                          inquiry.status === 'pending' 
                            ? 'bg-warning/15 text-warning' 
                            : 'bg-success/15 text-success'
                        )}>
                          {inquiry.status === 'pending' ? 'Pending' : 'Resolved'}
                        </span>
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground flex items-center gap-1.5"
                        )}>
                          <TypeIcon className="w-3.5 h-3.5" />
                          {typeLabels[inquiry.type]}
                        </span>
                      </div>
                    </div>

                    {/* Event Badge */}
                    <div className="mb-4">
                      <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-xl font-medium">
                        {getEventTitle(inquiry.eventId)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-foreground mb-2 text-lg">{inquiry.subject}</h3>
                    <p className="text-muted-foreground mb-5 leading-relaxed">
                      {inquiry.message}
                    </p>

                    {inquiry.status === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleReply(inquiry.id)}
                        className="flex items-center gap-2 px-6 py-3 btn-primary-gradient"
                      >
                        <Reply className="w-4 h-4" />
                        Send Reply
                      </motion.button>
                    )}

                    {inquiry.status === 'resolved' && (
                      <div className="flex items-center gap-2 text-success font-medium">
                        <Check className="w-5 h-5" />
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
