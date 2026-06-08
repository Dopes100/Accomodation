/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HouseDistance {
  mainCampus: number; // in km
  batanai: number;    // in km
  telOne: number;     // in km
}

export interface RoomOption {
  id: string;
  name: string;        // e.g. "Single Room (Ensuite)" or "2-People Sharing (No Ensuite)"
  sharingCount: number; // 1, 2, or 3 people
  ensuite: boolean;    // true / false
  price: number;       // in USD per month
  availableSlots: number;
  maxSlots: number;
}

export interface House {
  id: string;
  title: string;
  description: string;
  price: number; // in USD per month (default/base price)
  location: string; // e.g., "Nehosho", "Senga Area 2", "Windsor Park"
  roomType: "Single Room" | "Double Shared" | "Cottage Room" | "Boarding Hostel";
  genderLimit: "Mixed" | "Female Only" | "Male Only";
  distances: HouseDistance;
  features: string[]; // e.g. ["Wi-Fi", "Borehole Water", "Solar Backup", "Fitted Kitchen", "Durawalled", "Gated", "Hot Water"]
  images: string[]; // paths or URLs
  availableSlots: number;
  maxSlots: number;
  isAvailable: boolean;
  roomOptions?: RoomOption[]; // Optional room config variations with distinct pricing/ensuite
  underImprovements?: boolean;
  bookingLocked?: boolean;
}

export interface Booking {
  id: string;
  houseId: string;
  houseTitle: string;
  studentName: string;
  studentPhone: string;
  gender: "Male" | "Female";
  headsCount: number; // dynamic agent fee calculated as headsCount * 20
  targetMoveIn: string;
  notes: string;
  timestamp: string;
  completed?: boolean;
  paymentMethod?: "Cash" | "EcoCash";
  ecoCashNumber?: string;
  depositChoice?: "Full" | "None" | "Custom";
  customDepositAmount?: number;
  studentEmail?: string;
  proofOfPaymentBase64?: string;
  roomOptionId?: string;   // specific selected room variation
  roomOptionName?: string; // name of selected variation helper
  roomOptionPrice?: number; // stored price for booking reference
  emailStatus?: "sent" | "failed" | "simulated"; // email dispatch status
  emailError?: string; // error description if delivery failed
  emailSentAt?: string; // timestamp of email dispatch
}

// Pre-populated realistic student accommodations around Midlands State University (MSU) Gweru, Zimbabwe.
export const INITIAL_HOUSES: House[] = [
  {
    id: "h1",
    title: "Nehosho Elite Student Hub",
    description: "Premium student living situated in Nehosho, just a quick walk from the MSU Main Campus. Full state-of-the-art borehole water system with tank storage, modern fitted kitchen, super fast unlimited Wi-Fi, and 5kVA Solar system for uninterrupted study. Perfect for high-achievers who value security and comfort.",
    price: 90,
    location: "Nehosho, Gweru",
    roomType: "Double Shared",
    genderLimit: "Female Only",
    distances: {
      mainCampus: 0.8,
      batanai: 1.4,
      telOne: 5.8
    },
    features: ["Wi-Fi", "Borehole Water", "Solar Backup", "Fitted Kitchen", "Durawalled", "Gated", "Hot Water Geyser", "Caretaker"],
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
    ],
    availableSlots: 6,
    maxSlots: 12,
    isAvailable: true,
    roomOptions: [
      { id: "h1-o1", name: "Single Room (Ensuite Private Bathroom)", sharingCount: 1, ensuite: true, price: 120, availableSlots: 2, maxSlots: 2 },
      { id: "h1-o2", name: "2-People Sharing (Ensuite Private Bathroom)", sharingCount: 2, ensuite: true, price: 95, availableSlots: 4, maxSlots: 4 },
      { id: "h1-o3", name: "2-People Sharing (Standard Bathroom)", sharingCount: 2, ensuite: false, price: 80, availableSlots: 6, maxSlots: 6 }
    ]
  },
  {
    id: "h2",
    title: "Senga Area 2 Single Study Haven",
    description: "Affordable single bedrooms designed specifically for quiet private student life. Extremely close walk to MSU Main Gate. Features robust borehole water supply, solar reading lights in each room, security gate, and common sharing gas stoves. Clean study-centric hostel.",
    price: 120,
    location: "Senga Area 2, Gweru",
    roomType: "Single Room",
    genderLimit: "Mixed",
    distances: {
      mainCampus: 0.4,
      batanai: 1.1,
      telOne: 6.2
    },
    features: ["Borehole Water", "Solar Backup", "Durawalled", "Gated", "Study Desks", "Gas Stove Sharing", "Wi-Fi"],
    images: [
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
    ],
    availableSlots: 3,
    maxSlots: 8,
    isAvailable: true,
    roomOptions: [
      { id: "h2-o1", name: "Single Room (Luxury Ensuite)", sharingCount: 1, ensuite: true, price: 140, availableSlots: 2, maxSlots: 2 },
      { id: "h2-o2", name: "Single Room (Standard Private)", sharingCount: 1, ensuite: false, price: 110, availableSlots: 3, maxSlots: 3 },
      { id: "h2-o3", name: "2-People Sharing (Standard Study Corner)", sharingCount: 2, ensuite: false, price: 85, availableSlots: 4, maxSlots: 4 }
    ]
  },
  {
    id: "h3",
    title: "Windsor Park Student Mansions",
    description: "Spacious cottage rooms in Windsor Park. Ideally placed if you are doing some lectures at TelOne Campus or Main Campus, bridging the gap beautifully with excellent quietness. Pristine lawns, fully tiled floors, built-in cupboards, borehole water, high walls, and absolute peace of mind.",
    price: 110,
    location: "Windsor Park, Gweru",
    roomType: "Cottage Room",
    genderLimit: "Mixed",
    distances: {
      mainCampus: 3.2,
      batanai: 2.7,
      telOne: 2.3
    },
    features: ["Wi-Fi", "Borehole Water", "Solar Backup", "Fitted Kitchen", "Durawalled", "Gated", "Pristine Lawns", "Built-in Wardrobes"],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
    ],
    availableSlots: 4,
    maxSlots: 6,
    isAvailable: true
  },
  {
    id: "h4",
    title: "TelOne Road Premium Hostel",
    description: "Large boarding hostel primarily suited for IT and Engineering students, situated convenient to the Gweru central routes. Huge study lounge, high speed fiber Wi-Fi, 24/7 security agent, hot water, solar back-up, and regular private shuttle service. Extremely neat and professional environment.",
    price: 85,
    location: "Gweru Central / TelOne Route",
    roomType: "Boarding Hostel",
    genderLimit: "Male Only",
    distances: {
      mainCampus: 5.5,
      batanai: 5.0,
      telOne: 0.9
    },
    features: ["Wi-Fi", "Borehole Water", "Solar Backup", "Hot Water Geyser", "Security Guard", "Study Lounge", "Shuttle Access"],
    images: [
      "https://images.unsplash.com/photo-1555854877-abab0e564b86?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"
    ],
    availableSlots: 8,
    maxSlots: 20,
    isAvailable: true
  },
  {
    id: "h5",
    title: "Batanai Park Female Shared Sanctuary",
    description: "Highly secured family-style home in Batanai residential zone, tailored specifically for female students of MSU. Borehole solar pump, backup generator, high wall durawall and integrated gate, serene garden, and fitted gas and electric stove. Less than 5 minutes walk to Batanai Campus.",
    price: 75,
    location: "Batanai Area, Gweru",
    roomType: "Double Shared",
    genderLimit: "Female Only",
    distances: {
      mainCampus: 1.6,
      batanai: 0.3,
      telOne: 5.1
    },
    features: ["Wi-Fi", "Borehole Water", "Solar Backup", "Fitted Kitchen", "Durawalled", "Gated", "Warm Garden", "Washing Machine"],
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
    ],
    availableSlots: 2,
    maxSlots: 8,
    isAvailable: true
  },
  {
    id: "h6",
    title: "Cabs Executive Student Lodgings",
    description: "Magnificent newly built student space in Cabs area, featuring pristine security, spacious double rooms, high-speed Wi-Fi, modern study desks, and steady borehole water system. Exceptional academic environment.",
    price: 95,
    location: "Cabs, Gweru",
    roomType: "Double Shared",
    genderLimit: "Mixed",
    distances: {
      mainCampus: 1.0,
      batanai: 1.8,
      telOne: 5.2
    },
    features: ["Wi-Fi", "Borehole Water", "Solar Backup", "Modern Desks", "Durawalled", "Gated", "Hot Water Geyser"],
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
    ],
    availableSlots: 4,
    maxSlots: 8,
    isAvailable: true
  },
  {
    id: "h7",
    title: "CBZ Modern Shared Apartments",
    description: "Stunning shared apartments in the desirable CBZ sector. Extremely modern interior layout, built-in wardrobes, private study panels, high pressure solar borehole system, and supreme peace and quiet.",
    price: 100,
    location: "CBZ, Gweru",
    roomType: "Double Shared",
    genderLimit: "Mixed",
    distances: {
      mainCampus: 1.2,
      batanai: 1.9,
      telOne: 4.8
    },
    features: ["Wi-Fi", "Borehole Water", "Solar Backup", "Fitted Kitchen", "Washing Machine", "Caretaker"],
    images: [
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
    ],
    availableSlots: 5,
    maxSlots: 10,
    isAvailable: true
  },
  {
    id: "h8",
    title: "Randolph Quiet Study Cottage",
    description: "Serene cottage rooms tucked inside Randolph Gweru. Ideal for mature students looking for maximum privacy and absolute peace away from crowd noise. Lush garden, modern bathroom, and fully vetted secure walls.",
    price: 80,
    location: "Randolph, Gweru",
    roomType: "Cottage Room",
    genderLimit: "Mixed",
    distances: {
      mainCampus: 4.5,
      batanai: 3.5,
      telOne: 3.0
    },
    features: ["Solar Backup", "Borehole Water", "Pristine Lawns", "Durawalled", "Gated", "Study Desks", "Gas Cooking"],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
    ],
    availableSlots: 3,
    maxSlots: 4,
    isAvailable: true
  },
  {
    id: "h9",
    title: "KMP Solar Eco-Living Hub",
    description: "Fully sustainable eco-home in KMP with a heavy-duty 8kVA solar installation that powers everything including kettles, laptops, and stoves. Constant solar borehole, high speed unlimited Wi-Fi, and premium furnished kitchens.",
    price: 115,
    location: "KMP Solar, Gweru",
    roomType: "Single Room",
    genderLimit: "Female Only",
    distances: {
      mainCampus: 1.5,
      batanai: 1.1,
      telOne: 4.5
    },
    features: ["Wi-Fi", "Borehole Water", "Solar Backup", "Fitted Kitchen", "Security Guard", "Study Lounge", "Hot Water Geyser"],
    images: [
      "https://images.unsplash.com/photo-1555854877-abab0e564b86?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"
    ],
    availableSlots: 4,
    maxSlots: 6,
    isAvailable: true
  },
  {
    id: "h10",
    title: "KMP Zesa Vetted Rooms",
    description: "Economical student boarding space centered in KMP (Zesa powerline side), offering standard rooms, study desks, gas stove sharing, backup borehole water, and constant security parameters.",
    price: 85,
    location: "KMP Zesa, Gweru",
    roomType: "Double Shared",
    genderLimit: "Mixed",
    distances: {
      mainCampus: 1.7,
      batanai: 1.3,
      telOne: 4.2
    },
    features: ["Borehole Water", "Wi-Fi", "Gas Stove Sharing", "Durawalled", "Gated", "Study Desks"],
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
    ],
    availableSlots: 6,
    maxSlots: 10,
    isAvailable: true
  },
  {
    id: "h11",
    title: "Adelaide Park Student Oasis",
    description: "Premium single rooms and boardings at Adelaide Park, Gweru. Elegant floor design, modern tiled showers, super fast optic fiber Wi-Fi, secure high gate, and complete water backups. A true home away from home.",
    price: 130,
    location: "Adelaide Park, Gweru",
    roomType: "Single Room",
    genderLimit: "Mixed",
    distances: {
      mainCampus: 2.8,
      batanai: 2.2,
      telOne: 3.5
    },
    features: ["Wi-Fi", "Borehole Water", "Solar Backup", "Fitted Kitchen", "Durawalled", "Gated", "Lawn Garden"],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
    ],
    availableSlots: 2,
    maxSlots: 4,
    isAvailable: true
  },
  {
    id: "h13",
    title: "Psalms Villa",
    description: "Comfortable and safe student boardings located in the peaceful KMP Zesa area, just a short 0.5km (5-minute walk) to the MSU campus. Features spacious double sharing rooms on a beautiful white-and-grey marble patterned tiled floor. Each room is equipped with a clean study desk and wooden chair. Includes a secure steel partition safety gate, built-in storage shelving units, clean bathroom facilities, unlimited borehole water supply, high-speed Wi-Fi, and a lovely communal student kitchen fully fitted with Capri chest freezers and a wall-mounted flat-screen television.",
    price: 120,
    location: "KMP Zesa, Gweru",
    roomType: "Double Shared",
    genderLimit: "Mixed",
    distances: {
      mainCampus: 0.5,
      batanai: 1.1,
      telOne: 4.5
    },
    features: [
      "Water Borehole",
      "High-Speed Wi-Fi",
      "Marble Tile Flooring",
      "Study Desk & Chair",
      "Security Safety Gate",
      "Shared Kitchen TV",
      "Capri Chest Freezers",
      "Storage Shelves"
    ],
    images: [
      "/images/psalms/psalms_bedroom.png",
      "/images/psalms/psalms_kitchen.png",
      "/images/psalms/psalms_bathroom.png",
      "/images/psalms/psalms_exterior.png"
    ],
    availableSlots: 10,
    maxSlots: 10,
    isAvailable: true,
    roomOptions: [
      { id: "h13-o1", name: "2-People Sharing Room (Standard)", sharingCount: 2, ensuite: false, price: 120, availableSlots: 6, maxSlots: 6 },
      { id: "h13-o2", name: "2-People Sharing Room (Ensuite)", sharingCount: 2, ensuite: true, price: 140, availableSlots: 4, maxSlots: 4 }
    ]
  },
  {
    id: "h14",
    title: "Diagonal Opposite Allana House (New)",
    description: "Brand new high-quality student boardings located in the neat KMP Zesa area, diagonally opposite Allana House, just a short 0.8km walk to the MSU Main Campus. The property is currently undergoing final paint and minor finishing details (still under improvements) and cannot be secured for booking yet. Highly secured with a strong lockable steel security gate and includes high-quality unlimited borehole water supply. The residence offers spacious double-sharing rooms and includes a separate self-contained cottage option.",
    price: 120,
    location: "KMP Zesa, Gweru",
    roomType: "Double Shared",
    genderLimit: "Mixed",
    distances: {
      mainCampus: 0.8,
      batanai: 1.4,
      telOne: 4.5
    },
    features: [
      "High-Quality Borehole",
      "Gated Property",
      "Brand New Residence",
      "Under Improvements",
      "Self-Contained Cottage"
    ],
    images: [],
    availableSlots: 0,
    maxSlots: 8,
    isAvailable: false,
    underImprovements: true,
    roomOptions: [
      { id: "h14-o1", name: "2-People Sharing Room (Main House)", sharingCount: 2, ensuite: false, price: 120, availableSlots: 0, maxSlots: 6 },
      { id: "h14-o2", name: "Cottage Room (2-People Sharing)", sharingCount: 2, ensuite: true, price: 120, availableSlots: 0, maxSlots: 2 }
    ]
  }
];
