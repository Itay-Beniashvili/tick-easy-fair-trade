import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Clock, DollarSign, Users, Image, FileText, Music, Dumbbell, Theater, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ManagerSidebar } from '@/components/ManagerSidebar';
import { MobileManagerNav } from '@/components/MobileManagerNav';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const genres = [
  { id: 'music', label: 'Music', icon: Music },
  { id: 'sports', label: 'Sports', icon: Dumbbell },
  { id: 'theater', label: 'Theater', icon: Theater },
];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    venue: '',
    city: '',
    date: '',
    time: '',
    price: '',
    availableTickets: '',
    genre: '',
    description: '',
    image: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Event created successfully!');
      navigate('/manager/events');
    }, 1500);
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
              >
                <button
                  onClick={() => navigate('/manager/events')}
                  className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Events
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-xl">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Create New Event</h1>
                    <p className="text-white/70 mt-1">Fill in the details to launch your event</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-6">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Basic Info */}
            <div className="card-elevated p-6">
              <h2 className="font-bold text-lg mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                Basic Information
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Event Title</label>
                  <Input
                    placeholder="e.g., Taylor Swift - Eras Tour"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Artist / Performer</label>
                  <Input
                    placeholder="e.g., Taylor Swift"
                    value={formData.artist}
                    onChange={(e) => handleChange('artist', e.target.value)}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Genre</label>
                  <Select value={formData.genre} onValueChange={(value) => handleChange('genre', value)}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(genre => (
                        <SelectItem key={genre.id} value={genre.id}>
                          <span className="flex items-center gap-2">
                            <genre.icon className="w-4 h-4" />
                            {genre.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                  <Textarea
                    placeholder="Describe your event..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Location & Time */}
            <div className="card-elevated p-6">
              <h2 className="font-bold text-lg mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                Location & Time
              </h2>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Venue</label>
                    <Input
                      placeholder="e.g., SoFi Stadium"
                      value={formData.venue}
                      onChange={(e) => handleChange('venue', e.target.value)}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">City</label>
                    <Input
                      placeholder="e.g., Los Angeles"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Date
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      Time
                    </label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleChange('time', e.target.value)}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tickets & Pricing */}
            <div className="card-elevated p-6">
              <h2 className="font-bold text-lg mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
                Tickets & Pricing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Ticket Price ($)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    min="0"
                    step="0.01"
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Available Tickets
                  </label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.availableTickets}
                    onChange={(e) => handleChange('availableTickets', e.target.value)}
                    min="1"
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="card-elevated p-6">
              <h2 className="font-bold text-lg mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-highlight/10 flex items-center justify-center">
                  <Image className="w-5 h-5 text-highlight" />
                </div>
                Event Image
              </h2>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Image URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                  className="h-12 rounded-xl"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Paste a URL to your event image
                </p>
              </div>

              {formData.image && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4"
                >
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full max-w-sm h-48 object-cover rounded-2xl shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </motion.div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/manager/events')}
                className="flex-1 py-4 px-4 rounded-2xl border border-border text-foreground font-semibold hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                className={cn(
                  "flex-1 py-4 px-4 btn-primary-gradient font-semibold text-lg",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </main>

      <MobileManagerNav />
    </div>
  );
}
