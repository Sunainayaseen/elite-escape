import {
  Compass,
  Landmark,
  Martini,
  Mountain,
  Palmtree,
  Plane,
  PlaneTakeoff,
  SlidersHorizontal,
  Star,
  Ticket,
  Wallet,
} from "lucide-react";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Holidays", href: "/holidays" },
  { label: "Visa", href: "/global-visa" },
  { label: "Attractions", href: "/attractions" },
  { label: "Seasonal Tours", href: "/seasonal-tours" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
] as const;

// Only facts that can be derived from the data in this file — no invented statistics.
export const TRUST_STATS = [
  { label: "Offices", value: "2" },
  { label: "Holiday packages", value: "6" },
  { label: "Destinations", value: "7" },
  { label: "Working days", value: "Mon–Fri" },
] as const;

export const HOLIDAY_CATEGORIES = [
  {
    name: "Asia",
    slug: "asia",
    description: "Japan and Bali — city, culture and island itineraries.",
    icon: Palmtree,
    image: "/packages/a-33.jpg",
  },
  {
    name: "Europe",
    slug: "europe",
    description: "Paris, the United Kingdom and Russia's two capitals.",
    icon: Landmark,
    image: "/packages/paris.jpg",
  },
  {
    name: "Caucasus",
    slug: "caucasus",
    description: "Georgia and Armenia — mountains, monasteries and old cities.",
    icon: Mountain,
    image: "/packages/a-29.jpg",
  },
] as const;

export const IMG = {
  cityscape:
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80",
  europe:
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=80",
  beach:
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=80",
  planeWing:
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=80",
  eiffel:
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80",
  desert:
    "https://images.unsplash.com/photo-1638024510305-c36fcc0bf3b1?auto=format&fit=crop&w=1400&q=80",
  maldives:
    "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1400&q=80",
} as const;

// Source: the six packages published on eliteescapetourism.com (Sept 2026).
// Prices are the site's per-person ranges. Do not add packages, prices,
// ratings or inclusions that the business has not published.
export const PACKAGES = [
  {
    slug: "japan-tour-package",
    category: "asia",
    title: "Japan Tour Package",
    country: "Japan",
    duration: "7 Nights / 8 Days",
    currency: "AED",
    price_from: 4000,
    price_to: 5000,
    tour_types: ["City Tour"],
    group_size: "10 persons",
    image: IMG.cityscape,
    gallery: [],
    summary:
      "A journey that blends tradition with modernity across Tokyo, Kyoto, Nara and Osaka — historic temples, bamboo groves, deer parks and vibrant city life.",
    highlights: [
      "Mount Fuji & Lake Ashi cruise",
      "Fushimi Inari Shrine (red torii gates)",
      "Arashiyama Bamboo Forest",
      "Asakusa Temple & Nakamise Shopping",
      "Osaka Castle & Dotonbori",
      "Optional: kimono dress-up, tea ceremony, sushi-making, onsen visits",
    ],
    itinerary: [
      { day: 1, title: "Arrival in Tokyo", description: "Airport transfer and hotel check-in, with optional evening activities." },
      { day: 2, title: "Tokyo City Tour", description: "Asakusa Temple, Tokyo Skytree/Tower, Meiji Shrine, Harajuku and Shinjuku." },
      { day: 3, title: "Mt. Fuji & Hakone Day Tour", description: "Mount Fuji 5th Station, Lake Ashi cruise and the Hakone Ropeway." },
      { day: 4, title: "Bullet Train to Kyoto", description: "Shinkansen ride to Kyoto, Fushimi Inari Shrine and the Gion district." },
      { day: 5, title: "Kyoto Cultural Tour", description: "Kinkaku-ji (Golden Pavilion), Arashiyama Bamboo Grove and an optional tea ceremony." },
      { day: 6, title: "Nara Day Trip + Transfer to Osaka", description: "Todai-ji Temple, Nara Deer Park and Kasuga Taisha Shrine, then on to Osaka." },
      { day: 7, title: "Osaka City Tour", description: "Osaka Castle, Umeda Sky Building, Dotonbori and Shinsaibashi." },
      { day: 8, title: "Departure", description: "Hotel check-out and airport transfer to Kansai International (KIX)." },
    ],
    inclusions: [
      "Premium hotel accommodation",
      "Daily breakfast",
      "Airport transfers",
      "Bullet train (Shinkansen) travel",
      "Guided sightseeing tours",
    ],
    exclusions: [],
  },
  {
    slug: "georgia-armenia",
    category: "caucasus",
    title: "Georgia & Armenia Tour Package",
    country: "Georgia & Armenia",
    duration: "7 Nights / 8 Days",
    currency: "AED",
    price_from: 2000,
    price_to: 2500,
    tour_types: ["Adventure", "City Tour", "Hill Town"],
    group_size: "10 persons",
    image: "/packages/a-29.jpg",
    gallery: [],
    summary:
      "Explore the hidden gems of the Caucasus — from Tbilisi's vibrant streets and snow-capped Kazbegi to ancient Armenian monasteries and Lake Sevan.",
    highlights: [
      "Tbilisi city tour with cable car and Sulphur Baths",
      "Georgian Military Highway and Gergeti Trinity Church",
      "Border crossing assistance into Armenia",
      "Yerevan city tour",
      "Garni Temple, Geghard Monastery and Lake Sevan",
    ],
    itinerary: [
      { day: 1, title: "Arrival in Tbilisi", description: "Airport transfer, hotel check-in and a free evening to explore." },
      { day: 2, title: "Tbilisi City Tour", description: "Holy Trinity Cathedral, Metekhi Church, Narikala Fortress, cable car ride, Sulphur Baths and the Bridge of Peace." },
      { day: 3, title: "Gudauri – Kazbegi", description: "Georgian Military Highway, Ananuri Fortress, Zhinvali Reservoir and Gergeti Trinity Church (optional 4x4)." },
      { day: 4, title: "Armenia Border Crossing – Yerevan", description: "Border assistance, vehicle and guide change, with a stop at Haghpat Monastery." },
      { day: 5, title: "Yerevan City Tour", description: "Republic Square, Cascade Complex, Matenadaran, Vernissage Market and Tsitsernakaberd Memorial." },
      { day: 6, title: "Garni – Geghard – Lake Sevan", description: "Garni Temple, Geghard Monastery and Sevanavank Monastery." },
      { day: 7, title: "Free Day in Yerevan", description: "Shopping, museums, or an optional wine / Khor Virap tour." },
      { day: 8, title: "Departure", description: "Hotel check-out and airport transfer." },
    ],
    inclusions: [
      "Hotel accommodation",
      "Daily breakfast",
      "Guided tours",
      "All transfers",
      "Border formalities assistance",
    ],
    exclusions: [],
  },
  {
    slug: "bali-tour-package",
    category: "asia",
    title: "Bali Tour Package",
    country: "Indonesia",
    duration: "6 Nights / 7 Days",
    currency: "AED",
    price_from: 1299,
    price_to: 1800,
    tour_types: ["Adventure", "City Tour", "Couple", "Escorted Tour", "Family", "Hill Town"],
    group_size: "15 persons",
    image: "/packages/a-33.jpg",
    gallery: [],
    summary:
      "Bali's cultural heart in Ubud, the island scenery of Nusa Penida and the nightlife of Kuta & Seminyak — suited to honeymooners, families and independent travellers.",
    highlights: [
      "Tegenungan Waterfall and Ubud Art Market",
      "Monkey Forest and a Luwak coffee plantation visit",
      "Nusa Penida tour — Broken Beach, Angel's Billabong, Kelingking Beach",
      "Uluwatu Temple with a traditional Kecak Dance",
      "Tanah Lot Temple sunset",
      "Bali Swing photography",
      "Optional water sports at Tanjung Benoa",
    ],
    itinerary: [
      { day: 1, title: "Arrival in Bali – Kuta", description: "Airport transfer, hotel check-in and a free evening at Kuta Beach." },
      { day: 2, title: "Full-Day Ubud & Kintamani Tour", description: "Waterfalls, art markets, Monkey Forest, a coffee plantation and volcano views." },
      { day: 3, title: "Nusa Penida Island Tour", description: "Boat excursion to three beaches, lunch included." },
      { day: 4, title: "Uluwatu Temple + Sunset", description: "Temple visit, Kecak Dance and an optional beach dinner." },
      { day: 5, title: "Tanah Lot Temple & Bali Swing", description: "Bali Swing, Taman Ayun Temple and the iconic sea temple at sunset." },
      { day: 6, title: "Free Day", description: "Optional water sports, shopping or spa time." },
      { day: 7, title: "Departure", description: "Hotel check-out and airport transfer." },
    ],
    inclusions: [
      "Hotel accommodation",
      "Daily breakfast",
      "Private transfers",
      "Guided tours",
      "Island-hopping adventures",
    ],
    exclusions: [],
  },
  {
    slug: "russia-tour-package",
    category: "europe",
    title: "Russia Tour Package",
    country: "Russia",
    duration: "7 Nights / 8 Days",
    currency: "AED",
    price_from: 2400,
    price_to: 3000,
    tour_types: ["Adventure", "City Tour", "Couple", "Escorted Tour"],
    group_size: "10 persons",
    image: "/packages/a-37.jpg",
    gallery: [],
    summary:
      "An 8-day tour of Moscow and St. Petersburg — iconic landmarks, imperial palaces, a high-speed train between the capitals and English-speaking guides.",
    highlights: [
      "Red Square, St. Basil's Cathedral and Lenin's Mausoleum",
      "Kremlin grounds & cathedrals",
      "Moscow's underground metro stations",
      "Hermitage Museum (Winter Palace)",
      "Peterhof Palace and Lower Gardens",
      "Church of the Savior on Spilled Blood",
      "Optional Catherine Palace visit",
    ],
    itinerary: [
      { day: 1, title: "Arrival in Moscow", description: "Airport transfer, hotel check-in and an optional evening walk." },
      { day: 2, title: "Moscow City Tour", description: "Red Square, St. Basil's, the Kremlin, Sparrow Hills and Arbat Street." },
      { day: 3, title: "Metro Tour + Free Time", description: "Metro stations tour, with optional markets and parks in your free time." },
      { day: 4, title: "High-Speed Train to St. Petersburg", description: "Sapsan train journey, hotel transfer and a walk along Nevsky Prospect." },
      { day: 5, title: "St. Petersburg City Tour", description: "Hermitage Museum, cathedrals, Palace Square and Peter and Paul Fortress." },
      { day: 6, title: "Peterhof Palace & Gardens", description: "Day trip to Peterhof, the Lower Gardens and the Grand Palace." },
      { day: 7, title: "Free Day or Optional Tour", description: "Optional Catherine Palace visit or a canal cruise." },
      { day: 8, title: "Departure", description: "Hotel check-out and airport transfer." },
    ],
    inclusions: [
      "4-star hotel accommodation",
      "Daily breakfast",
      "City tours with expert guides",
      "High-speed train travel",
      "Meet and greet service",
    ],
    exclusions: [],
  },
  {
    slug: "uk-tour-package",
    category: "europe",
    title: "UK Tour Package",
    country: "United Kingdom",
    duration: "7 Nights / 8 Days",
    currency: "AED",
    price_from: 4100,
    price_to: 5000,
    tour_types: ["City Tour", "Couple", "Escorted Tour", "Family"],
    group_size: "10 persons",
    image: "/packages/a-41.jpg",
    gallery: [],
    summary:
      "Royal heritage, historic landmarks and countryside scenery across London, Windsor, Oxford, Stonehenge, Bath and Edinburgh.",
    highlights: [
      "Big Ben, Westminster Abbey, London Eye, Tower of London and Buckingham Palace",
      "Changing of the Guard ceremony and Tower Bridge",
      "Windsor Castle",
      "Stonehenge",
      "Roman Baths and the city of Bath",
      "Oxford University and Cotswolds villages",
      "Edinburgh Castle, Holyrood Palace and Arthur's Seat",
      "Optional Warner Bros Studio Tour (Harry Potter)",
    ],
    itinerary: [
      { day: 1, title: "Arrival in London", description: "Airport transfer, with the evening free for shopping or a Thames cruise." },
      { day: 2, title: "London City Tour", description: "Guided tour of Big Ben, Westminster, the London Eye, Tower of London, Buckingham Palace and the Guard ceremony." },
      { day: 3, title: "Windsor, Stonehenge & Bath", description: "Windsor Castle, Stonehenge and the Roman Baths." },
      { day: 4, title: "Oxford & Cotswolds", description: "Oxford University colleges and traditional English villages." },
      { day: 5, title: "Free Day / Optional Studio Tour", description: "Shopping at Oxford Street or Harrods, or the optional Harry Potter studio tour." },
      { day: 6, title: "London to Edinburgh", description: "High-speed train to Scotland and a walk along the Royal Mile." },
      { day: 7, title: "Edinburgh City Tour", description: "Edinburgh Castle, Holyrood Palace, Arthur's Seat and museums." },
      { day: 8, title: "Departure", description: "Hotel check-out and airport transfer." },
    ],
    inclusions: [
      "3/4-star hotel stays",
      "Daily breakfast",
      "Guided sightseeing tours",
      "Intercity train travel (London – Edinburgh)",
      "Comfortable transfers",
    ],
    exclusions: [
      "International flights",
      "Optional activities (Thames cruise, Warner Bros tour)",
      "Meals beyond breakfast",
      "Travel insurance",
      "Personal expenses",
    ],
  },
  {
    slug: "paris-france-tour-package",
    category: "europe",
    title: "Paris, France Tour Package",
    country: "France",
    duration: "5 Nights / 6 Days",
    currency: "AED",
    price_from: 5000,
    price_to: 6000,
    tour_types: ["Adventure", "City Tour", "Couple", "Escorted Tour", "Family"],
    group_size: "10 persons",
    image: "/packages/paris.jpg",
    gallery: [],
    summary:
      "Paris's most iconic landmarks — the Eiffel Tower, the Louvre, Montmartre and Versailles — with optional Disneyland Paris.",
    highlights: [
      "Eiffel Tower (2nd level access)",
      "Louvre Museum with skip-the-line entry",
      "Arc de Triomphe & Champs-Élysées",
      "Versailles Palace & Hall of Mirrors",
      "Montmartre & Sacré-Cœur Basilica",
      "Seine River Cruise",
      "Optional Moulin Rouge cabaret show",
      "Optional Disneyland Paris",
    ],
    itinerary: [
      { day: 1, title: "Arrival in Paris", description: "Airport arrival, private transfer and an optional Seine River Cruise." },
      { day: 2, title: "Paris City Tour + Eiffel Tower", description: "Guided tour of the Eiffel Tower, Arc de Triomphe, Champs-Élysées and Notre-Dame, with a leisure afternoon." },
      { day: 3, title: "Louvre Museum & Montmartre", description: "Louvre visit with skip-the-line access and Montmartre exploration; optional Moulin Rouge." },
      { day: 4, title: "Versailles Palace Tour", description: "Royal apartments and the Hall of Mirrors, with free time in the afternoon." },
      { day: 5, title: "Optional Disneyland / Leisure Day", description: "Full-day Disneyland Paris visit, or leisure shopping and relaxation." },
      { day: 6, title: "Departure", description: "Hotel check-out and airport transfer." },
    ],
    inclusions: [
      "Hotel accommodation (5 nights)",
      "Daily breakfast",
      "City tours with guided services",
      "Seine River Cruise",
      "Private airport transfers",
      "Skip-the-line Louvre entry",
    ],
    exclusions: [
      "Optional Disneyland Paris tickets",
      "Optional Moulin Rouge cabaret show",
      "Personal expenses and shopping",
      "Travel insurance",
    ],
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell us where to",
    description: "Pick a destination or let us know your travel style — beach, city, desert, or bucket-list.",
    icon: Compass,
  },
  {
    step: "02",
    title: "We customize it",
    description: "Our travel experts build a package around your dates, budget, and must-sees.",
    icon: SlidersHorizontal,
  },
  {
    step: "03",
    title: "Book & fly",
    description: "Confirm your itinerary, sort your visa if needed, and we handle the rest.",
    icon: PlaneTakeoff,
  },
] as const;

// Testimonials are intentionally empty. Only genuine, owner-approved reviews
// may be added here; the home page pulls real Google reviews when configured.
export const TESTIMONIALS: readonly {
  name: string;
  location: string;
  quote: string;
  rating: number;
}[] = [];

export const FAQS = [
  {
    question: "How do I book a holiday package?",
    answer:
      "Open the package you like and use Enquire Now, or message us on WhatsApp. Our team will confirm the details with you and guide you through the next steps.",
  },
  {
    question: "Do you handle visa applications?",
    answer:
      "Yes. Our Visa Assistance team guides you through document preparation and the application process, either alongside a holiday package or as a standalone service. Final approval always rests with the relevant embassy or consulate.",
  },
  {
    question: "Can I customize a package instead of booking a fixed itinerary?",
    answer:
      "Yes. Every package listed is a starting point — tell us your dates and preferences and we will personalize it with you.",
  },
  {
    question: "What's included in the price shown on a package?",
    answer:
      "Prices are shown as a per-person range in AED. Inclusions and exclusions are listed on each package page. International flights are not included unless a package says so.",
  },
  {
    question: "How do I contact Elite Escape Tourism?",
    answer:
      "Call, WhatsApp or email us, or send an inquiry through the contact form. We have offices in Dubai and Lahore and work Monday to Friday, 9AM – 5PM.",
  },
] as const;

export const FOOTER_QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Holidays", href: "/holidays" },
  { label: "Visa", href: "/global-visa" },
  { label: "Attractions", href: "/attractions" },
  { label: "Seasonal Tours", href: "/seasonal-tours" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
] as const;

export const FOOTER_TOUR_TYPES = [
  { label: "Asia", href: "/holidays/asia", icon: Palmtree },
  { label: "Europe", href: "/holidays/europe", icon: Landmark },
  { label: "Caucasus", href: "/holidays/caucasus", icon: Mountain },
] as const;

export const OFFICES = [
  {
    city: "Dubai Office",
    address:
      "City Gate Building, Hashtag Business Center, M Floor, Office 16 — Dubai, UAE",
    phones: ["+971 55 575 3133"],
    note: "1 hr 32 min from Dubai city centre",
  },
  {
    city: "Pakistan Office",
    address:
      "Office No. 50, Mezzanine Floor, Ashiana Shopping Centre, Main Boulevard, Gulberg III, Lahore, Pakistan",
    phones: ["+92 302 9198 308"],
  },
] as const;

export const CONTACT_EMAIL = "info@eliteescapetourism.com";

export const WORKING_HOURS = "Working Days: Monday – Friday (9AM – 5PM)";

// Source: the UAE Attractions page on eliteescapetourism.com. Descriptions of landmarks are kept
// neutral; do not add prices, tickets or "book now" claims the business has not published.
// `image: null` = Client Information Required (no verified photo yet); the page shows a fallback tile.
export const ATTRACTIONS = [
  {
    name: "Museum of the Future",
    description: "One of Dubai's most recognisable modern landmarks.",
    image: null,
  },
  {
    name: "Sheikh Zayed Grand Mosque",
    description: "Abu Dhabi's landmark mosque, known for its white marble architecture.",
    image:
      "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Burj Khalifa",
    description: "The centrepiece of Dubai's skyline.",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "The Dubai Frame",
    description: "A frame-shaped landmark that looks across old and new Dubai.",
    image: null,
  },
  {
    name: "Louvre Abu Dhabi",
    description: "A cultural landmark and museum in Abu Dhabi.",
    image: null,
  },
  {
    name: "Dhow Cruise, Dubai Marina",
    description: "A traditional dhow cruise along Dubai Marina.",
    image: null,
  },
  {
    name: "Desert Safari",
    description:
      "Dune bashing in a 4x4, camel rides, sandboarding, Bedouin-style camping, BBQ dining, belly dancing and Tanoura dance performances.",
    image:
      "https://images.unsplash.com/photo-1638024510305-c36fcc0bf3b1?auto=format&fit=crop&w=1200&q=80",
  },
] as const;

// Source: the Seasonal Packages page on eliteescapetourism.com. The live site lists no prices or
// durations for these — they are enquiry-only. Entries with a matching published package link to
// it; the rest link to the contact page.
export const SEASONAL_TOURS = [
  {
    name: "Eid Holidays in the Maldives",
    window: "Eid",
    description:
      "An Eid package with overwater bungalows, crystal-clear waters and pristine white-sand beaches.",
    image: IMG.maldives,
    href: "/contact",
  },
  {
    name: "Winter in the Swiss Alps",
    window: "Winter",
    description: "Cosy chalet stays, ski passes and mountain views in Interlaken.",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    href: "/contact",
  },
  {
    name: "National Day Holiday in London",
    window: "National Day",
    description: "Iconic landmarks, shopping and vibrant city life in London.",
    image: "/packages/a-41.jpg",
    href: "/holidays/europe/uk-tour-package",
  },
  {
    name: "Summer Escape to Bali",
    window: "Summer",
    description: "Rice terraces, ancient temples and local markets.",
    image: "/packages/a-33.jpg",
    href: "/holidays/asia/bali-tour-package",
  },
  {
    name: "New Year's in New York",
    window: "New Year",
    description:
      "Ring in the New Year in Times Square and feel the atmosphere of the city that never sleeps.",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
    href: "/contact",
  },
  {
    name: "Japan Cherry Blossom Tour",
    window: "Sakura season",
    description: "Tokyo and Kyoto during cherry blossom season.",
    image:
      "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80",
    href: "/holidays/asia/japan-tour-package",
  },
] as const;
