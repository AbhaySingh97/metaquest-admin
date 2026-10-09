export interface CurriculumModule {
  step: number;
  title: string;
  duration: string;
  topics: string[];
  handsOnActivity: string;
  deliverable: string;
  speaker?: string;
}

export interface Workshop {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  duration: string;
  originalPrice: number;
  discountedPrice: number;
  totalSeats: number;
  seatsBooked: number;
  badge: string;
  category: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
  googleMeetLink?: string;
  googleFormUrl?: string;
  syllabusFile?: string;
  curriculum: CurriculumModule[];
  handsOnOutcomes: string[];
  prerequisites: string[];
  toolsProvided: string[];
  testimonial?: {
    name: string;
    role: string;
    college: string;
    quote: string;
  };
}

export interface MetricItem {
  id: string;
  label: string;
  value: string;
  detail: string;
}

export interface FAQItem {
  id: string;
  q: string;
  a: string;
}

export interface SiteSettings {
  announcement: string;
  heroHeadline: string;
  heroHighlight: string;
  heroSubtitle: string;
  nextCohortDate: string;
  metrics: MetricItem[];
  faqs: FAQItem[];
}

export interface StoredRegistration {
  id: string;
  ticketCode: string;
  workshopId: string;
  workshopTitle: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  amount: number;
  paymentId: string;
  registeredAt: string;
  status: "CONFIRMED" | "CANCELLED";
}
