export interface Event {
  id: string;
  title: string;
  artist: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  price: number;
  originalPrice: number;
  image: string;
  genre: 'music' | 'sports' | 'theater';
  description: string;
  availableTickets: number;
  resaleTickets: ResaleTicket[];
}

export interface ResaleTicket {
  id: string;
  eventId: string;
  originalPrice: number;
  resalePrice: number;
  section: string;
  row: string;
  seat: string;
  verified: boolean;
  sellerId: string;
}

export interface UserTicket {
  id: string;
  eventId: string;
  purchaseDate: string;
  originalPrice: number;
  section: string;
  row: string;
  seat: string;
  qrCode: string;
  isForSale: boolean;
  salePrice?: number;
}

export interface Inquiry {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  date: string;
  status: 'pending' | 'resolved';
  type: 'refund' | 'question' | 'complaint';
}

export interface SalesData {
  day: string;
  sales: number;
  revenue: number;
}

export const events: Event[] = [
  {
    id: '1',
    title: 'שלמה ארצי בקיסריה',
    artist: 'שלמה ארצי',
    venue: 'אמפיתיאטרון קיסריה',
    city: 'קיסריה',
    date: '2024-08-15',
    time: '21:00',
    price: 350,
    originalPrice: 350,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=80',
    genre: 'music',
    description: 'הופעה מרגשת של האמן האהוב שלמה ארצי באמפיתיאטרון קיסריה. ערב של שירים אהובים ורגעים בלתי נשכחים.',
    availableTickets: 156,
    resaleTickets: [
      {
        id: 'r1',
        eventId: '1',
        originalPrice: 350,
        resalePrice: 320,
        section: 'A',
        row: '5',
        seat: '12',
        verified: true,
        sellerId: 'user123'
      },
      {
        id: 'r2',
        eventId: '1',
        originalPrice: 350,
        resalePrice: 350,
        section: 'B',
        row: '8',
        seat: '24',
        verified: true,
        sellerId: 'user456'
      }
    ]
  },
  {
    id: '2',
    title: 'מכבי תל אביב נגד ברצלונה',
    artist: 'יורוליג',
    venue: 'היכל מנורה מבטחים',
    city: 'תל אביב',
    date: '2024-09-22',
    time: '20:30',
    price: 450,
    originalPrice: 450,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80',
    genre: 'sports',
    description: 'משחק יורוליג מרתק בין מכבי תל אביב לברצלונה. אווירה סוערת וכדורסל ברמה הגבוהה ביותר.',
    availableTickets: 89,
    resaleTickets: [
      {
        id: 'r3',
        eventId: '2',
        originalPrice: 450,
        resalePrice: 400,
        section: 'VIP',
        row: '2',
        seat: '8',
        verified: true,
        sellerId: 'user789'
      }
    ]
  },
  {
    id: '3',
    title: 'פסטיבל טכנו ישראל',
    artist: 'אמנים שונים',
    venue: 'פארק הירקון',
    city: 'תל אביב',
    date: '2024-10-05',
    time: '22:00',
    price: 280,
    originalPrice: 280,
    image: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&auto=format&fit=crop&q=80',
    genre: 'music',
    description: 'פסטיבל הטכנו הגדול בישראל עם DJ-ים מהשורה הראשונה. לילה של מוזיקה אלקטרונית וחוויה בלתי נשכחת.',
    availableTickets: 234,
    resaleTickets: []
  },
  {
    id: '4',
    title: 'המלך ליר - הבימה',
    artist: 'תיאטרון הבימה',
    venue: 'תיאטרון הבימה',
    city: 'תל אביב',
    date: '2024-08-28',
    time: '20:00',
    price: 180,
    originalPrice: 180,
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop&q=80',
    genre: 'theater',
    description: 'הפקה חדשה ומרהיבה של המחזה הקלאסי של שייקספיר בבימוי חדשני.',
    availableTickets: 45,
    resaleTickets: [
      {
        id: 'r4',
        eventId: '4',
        originalPrice: 180,
        resalePrice: 150,
        section: 'יציע',
        row: '3',
        seat: '15',
        verified: true,
        sellerId: 'user101'
      }
    ]
  },
  {
    id: '5',
    title: 'עידן רייכל - סיבוב הפרידה',
    artist: 'עידן רייכל',
    venue: 'בלומפילד',
    city: 'תל אביב',
    date: '2024-11-12',
    time: '20:00',
    price: 420,
    originalPrice: 420,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=80',
    genre: 'music',
    description: 'סיבוב הופעות הפרידה של פרויקט עידן רייכל. הזדמנות אחרונה לחוות את הקסם.',
    availableTickets: 12,
    resaleTickets: []
  }
];

export const userTickets: UserTicket[] = [
  {
    id: 't1',
    eventId: '1',
    purchaseDate: '2024-07-20',
    originalPrice: 350,
    section: 'B',
    row: '12',
    seat: '7',
    qrCode: 'TICK-2024-SHL-001',
    isForSale: false
  }
];

export const inquiries: Inquiry[] = [
  {
    id: 'inq1',
    userId: 'user001',
    userName: 'דני כהן',
    subject: 'בקשת החזר',
    message: 'שלום, אני צריך לבטל את ההזמנה שלי לאירוע בקיסריה עקב מחלה. האם אפשר לקבל החזר?',
    date: '2024-08-01',
    status: 'pending',
    type: 'refund'
  },
  {
    id: 'inq2',
    userId: 'user002',
    userName: 'שרה לוי',
    subject: 'שאלה על מיקום המושבים',
    message: 'רכשתי כרטיסים לקטגוריה B, האם יש מפה שמראה את מיקום המושבים?',
    date: '2024-08-02',
    status: 'pending',
    type: 'question'
  },
  {
    id: 'inq3',
    userId: 'user003',
    userName: 'יוסי ישראלי',
    subject: 'בעיה בתשלום',
    message: 'ניסיתי לרכוש כרטיסים אבל התשלום נכשל. כרטיס האשראי תקין.',
    date: '2024-08-03',
    status: 'resolved',
    type: 'complaint'
  }
];

export const salesData: SalesData[] = [
  { day: 'ראשון', sales: 45, revenue: 15750 },
  { day: 'שני', sales: 32, revenue: 11200 },
  { day: 'שלישי', sales: 58, revenue: 20300 },
  { day: 'רביעי', sales: 41, revenue: 14350 },
  { day: 'חמישי', sales: 67, revenue: 23450 },
  { day: 'שישי', sales: 89, revenue: 31150 },
  { day: 'שבת', sales: 112, revenue: 39200 },
];

export const genreLabels: Record<string, string> = {
  music: 'מוזיקה',
  sports: 'ספורט',
  theater: 'תיאטרון'
};
