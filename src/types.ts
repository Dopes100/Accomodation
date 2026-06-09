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
export const INITIAL_HOUSES: House[] = [];
