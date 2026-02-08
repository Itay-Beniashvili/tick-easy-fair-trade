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
  eventId: string;
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
    title: 'Taylor Swift - Eras Tour',
    artist: 'Taylor Swift',
    venue: 'SoFi Stadium',
    city: 'Los Angeles',
    date: '2024-08-15',
    time: '7:00 PM',
    price: 350,
    originalPrice: 350,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=80',
    genre: 'music',
    description: 'Experience the magic of Taylor Swift live on her record-breaking Eras Tour. A night of unforgettable music spanning her entire career.',
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
    title: 'Lakers vs Warriors',
    artist: 'NBA',
    venue: 'Crypto.com Arena',
    city: 'Los Angeles',
    date: '2024-09-22',
    time: '7:30 PM',
    price: 450,
    originalPrice: 450,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80',
    genre: 'sports',
    description: 'The ultimate showdown between the Los Angeles Lakers and Golden State Warriors. Experience NBA basketball at its finest.',
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
    title: 'Electric Daisy Carnival',
    artist: 'Various Artists',
    venue: 'Las Vegas Motor Speedway',
    city: 'Las Vegas',
    date: '2024-10-05',
    time: '5:00 PM',
    price: 280,
    originalPrice: 280,
    image: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&auto=format&fit=crop&q=80',
    genre: 'music',
    description: 'The world\'s largest dance music festival featuring top DJs from around the globe. Three days of non-stop electronic music.',
    availableTickets: 234,
    resaleTickets: []
  },
  {
    id: '4',
    title: 'Hamilton - Broadway',
    artist: 'Lin-Manuel Miranda',
    venue: 'Richard Rodgers Theatre',
    city: 'New York',
    date: '2024-08-28',
    time: '8:00 PM',
    price: 180,
    originalPrice: 180,
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop&q=80',
    genre: 'theater',
    description: 'The revolutionary musical that changed Broadway forever. Experience the story of Alexander Hamilton like never before.',
    availableTickets: 45,
    resaleTickets: [
      {
        id: 'r4',
        eventId: '4',
        originalPrice: 180,
        resalePrice: 150,
        section: 'Mezzanine',
        row: '3',
        seat: '15',
        verified: true,
        sellerId: 'user101'
      }
    ]
  },
  {
    id: '5',
    title: 'Coldplay - Music of the Spheres',
    artist: 'Coldplay',
    venue: 'MetLife Stadium',
    city: 'New Jersey',
    date: '2024-11-12',
    time: '7:00 PM',
    price: 420,
    originalPrice: 420,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=80',
    genre: 'music',
    description: 'Coldplay\'s spectacular eco-friendly world tour featuring stunning visuals, LED wristbands, and all your favorite hits.',
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
    qrCode: 'TICK-2024-TSW-001',
    isForSale: false
  }
];

export const inquiries: Inquiry[] = [
  {
    id: 'inq1',
    userId: 'user001',
    userName: 'John Smith',
    eventId: '1',
    subject: 'Refund Request',
    message: 'Hi, I need to cancel my tickets for the Taylor Swift concert due to a family emergency. Can I get a refund?',
    date: '2024-08-01',
    status: 'pending',
    type: 'refund'
  },
  {
    id: 'inq2',
    userId: 'user002',
    userName: 'Sarah Johnson',
    eventId: '1',
    subject: 'Seat Location Question',
    message: 'I purchased tickets for Section B. Is there a map showing the exact seat locations?',
    date: '2024-08-02',
    status: 'pending',
    type: 'question'
  },
  {
    id: 'inq3',
    userId: 'user003',
    userName: 'Mike Wilson',
    eventId: '2',
    subject: 'Payment Issue',
    message: 'I tried to purchase tickets but my payment failed. My credit card is valid.',
    date: '2024-08-03',
    status: 'resolved',
    type: 'complaint'
  },
  {
    id: 'inq4',
    userId: 'user004',
    userName: 'Emily Brown',
    eventId: '4',
    subject: 'Accessibility Question',
    message: 'Do you have wheelchair accessible seating available for Hamilton?',
    date: '2024-08-04',
    status: 'pending',
    type: 'question'
  },
  {
    id: 'inq5',
    userId: 'user005',
    userName: 'David Lee',
    eventId: '5',
    subject: 'Group Discount',
    message: 'We are a group of 10 people. Is there a group discount available for the Coldplay concert?',
    date: '2024-08-05',
    status: 'pending',
    type: 'question'
  }
];

export const salesData: SalesData[] = [
  { day: 'Sun', sales: 45, revenue: 15750 },
  { day: 'Mon', sales: 32, revenue: 11200 },
  { day: 'Tue', sales: 58, revenue: 20300 },
  { day: 'Wed', sales: 41, revenue: 14350 },
  { day: 'Thu', sales: 67, revenue: 23450 },
  { day: 'Fri', sales: 89, revenue: 31150 },
  { day: 'Sat', sales: 112, revenue: 39200 },
];

export const genreLabels: Record<string, string> = {
  music: 'Music',
  sports: 'Sports',
  theater: 'Theater'
};
