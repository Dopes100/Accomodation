/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { House, Booking } from "./types";
import HouseCard from "./components/HouseCard";
import BookingFormModal from "./components/BookingFormModal";
import AdminDashboard from "./components/AdminDashboard";
import { 
  initializeDatabaseIfEmpty, 
  subscribeToHouses, 
  subscribeToBookings, 
  saveHouseToFirestore, 
  deleteHouseFromFirestore, 
  submitBookingToFirestore, 
  deleteBookingFromFirestore, 
  toggleBookingCompletedInFirestore,
  deleteAllBookingsFromFirestore
} from "./firebaseUtils";
// @ts-expect-error - Vite handles loading of png assets at compile-time
import heroImage from "./assets/images/student_accommodation_hero_1779802930883.png";
import { 
  Home, 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  HelpCircle, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone, 
  Info, 
  Users, 
  ArrowUpDown,
  Lock,
  MessageSquare
} from "lucide-react";

export default function App() {
  const [houses, setHouses] = useState<House[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedRoomClass, setSelectedRoomClass] = useState("All");
  const [sortOption, setSortOption] = useState<"price-low" | "price-high" | "dist-main" | "dist-batanai" | "dist-telone">("dist-main");

  // Authentication/Dashboard modal
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // Booking modal
  const [selectedHouseForBooking, setSelectedHouseForBooking] = useState<House | null>(null);

  // Initialize and subscribe in useEffect
  useEffect(() => {
    let unsubscribeHouses: (() => void) | undefined;
    let unsubscribeBookings: (() => void) | undefined;

    async function init() {
      // 1. Initialize DB with fallback data if empty
      await initializeDatabaseIfEmpty();

      // 2. Listen in real-time to houses
      unsubscribeHouses = subscribeToHouses((updatedHouses) => {
        setHouses(updatedHouses);
        setLoading(false);
      });

      // 3. Listen in real-time to bookings
      unsubscribeBookings = subscribeToBookings((updatedBookings) => {
        setBookings(updatedBookings);
      });
    }

    init();

    return () => {
      if (unsubscribeHouses) unsubscribeHouses();
      if (unsubscribeBookings) unsubscribeBookings();
    };
  }, []);

  // House actions from Admin
  const handleAddHouse = async (newHouse: House) => {
    await saveHouseToFirestore(newHouse);
  };

  const handleEditHouse = async (editedHouse: House) => {
    await saveHouseToFirestore(editedHouse);
  };

  const handleDeleteHouse = async (id: string) => {
    await deleteHouseFromFirestore(id);
  };

  // Booking actions from Student Page / Admin
  const handleBookingSubmit = async (newBooking: Booking) => {
    // Find matching house to atomically subtract spots
    const matchedHouse = houses.find((h) => h.id === newBooking.houseId);
    if (matchedHouse) {
      await submitBookingToFirestore(newBooking, matchedHouse);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    await deleteBookingFromFirestore(id);
  };

  const handleDeleteAllBookings = async () => {
    await deleteAllBookingsFromFirestore();
  };

  const handleToggleBookingCompleted = async (id: string) => {
    const bookingToToggle = bookings.find((b) => b.id === id);
    if (bookingToToggle) {
      await toggleBookingCompletedInFirestore(bookingToToggle);
    }
  };

  // Get locations list for dropdown
  const uniqueLocations = ["All", ...Array.from(new Set(houses.map((h) => h.location.split(",")[0].trim())))];
  
  // Get room types list
  const uniqueRoomClasses = ["All", "Single Room", "Double Shared", "Cottage Room", "Boarding Hostel"];

  // Filter & Sort core listings
  const filteredHouses = houses.filter((house) => {
    const matchesSearch = 
      house.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      house.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      house.location.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesLocation = 
      selectedLocation === "All" || 
      house.location.toLowerCase().includes(selectedLocation.toLowerCase());
      
    const matchesRoomClass = 
      selectedRoomClass === "All" || 
      house.roomType === selectedRoomClass;
      
    return matchesSearch && matchesLocation && matchesRoomClass;
  });

  // Apply Sorting
  const sortedHouses = [...filteredHouses].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "dist-main":
        return a.distances.mainCampus - b.distances.mainCampus;
      case "dist-batanai":
        return a.distances.batanai - b.distances.batanai;
      case "dist-telone":
        return a.distances.telOne - b.distances.telOne;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo / Title */}
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/10 border border-blue-500">
                D
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-lg font-black tracking-tight text-blue-900">DOPES ACCOMMODATION</span>
                  <span className="hidden sm:inline-block text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">Off Campus (Rez)</span>
                </div>
                <p className="text-[10px] sm:text-xs text-neutral-400 font-medium tracking-wide">Midlands State University Student Housing Hub - Off Campus (Rez)</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <a 
                href="https://api.whatsapp.com/send?phone=263780736072&text=Hello%20DOPES%20MSU%20Accommodation!%20I'm%20looking%20for%20available%20student%20homes." 
                target="_blank" 
                rel="noreferrer"
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 hover:shadow-sm"
              >
                <MessageSquare size={15} />
                <span className="hidden md:inline">WhatsApp Agent</span>
              </a>

              <button
                onClick={() => setIsAdminOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3.5 sm:px-4.5 py-2.5 text-xs sm:text-sm font-bold tracking-wide shadow-xs border border-blue-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lock size={14} />
                <span>Admin Login</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner Section using generated asset */}
      <section className="relative overflow-hidden bg-slate-950 text-white pb-32 pt-20">
        <div className="absolute inset-0 z-0 opacity-60">
          <img
            src={heroImage}
            alt="Student Accommodation exterior"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Subtle linear overlay to preserve high image clarity while maintaining readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/75 z-0" />

        <div className="relative max-w-4xl mx-auto px-4 z-10 text-center space-y-6">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/10 text-slate-250 border border-white/15 px-3.5 py-1.5 rounded-full uppercase tracking-widest leading-none">
            <Sparkles size={11} className="text-yellow-400 mb-0.5" /> Secure Off-Campus Housing Made Easy
          </span>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Premium Midlands State University <span className="text-slate-300">Off Campus (Rez) Student Homes</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Browse fully vetted boarding houses, cottages, and rooms around Nehosho, Senga, Windsor, and Gweru. Track distance meters directly from Main Campus, Batanai, and TelOne. Select your spot and lock it on WhatsApp instantly.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-6 text-[11px] font-bold text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-950/65 px-3.5 py-2 rounded-xl border border-slate-800/40">
              <CheckCircle2 size={13} className="text-emerald-400" /> Unlimited Solar Boreholes
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950/65 px-3.5 py-2 rounded-xl border border-slate-800/40">
              <CheckCircle2 size={13} className="text-emerald-400" /> High Speed Wi-Fi Vetted
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950/65 px-3.5 py-2 rounded-xl text-yellow-300 border border-slate-800/40">
              <CheckCircle2 size={13} className="text-yellow-400 animate-pulse" /> $20 Booking Fee Per Head
            </span>
          </div>
        </div>
      </section>

      {/* Search Filters Section - Overlaps the Hero slightly */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-16 z-10">
        <div className="bg-white rounded-3xl border border-blue-50 p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b pb-3.5 text-blue-900 border-neutral-100">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={16} className="text-blue-600" />
              <h2 className="text-sm font-black uppercase tracking-wider">Accommodation Search Filter</h2>
            </div>
            <span className="text-xs font-semibold text-neutral-400">
              Found {sortedHouses.length} match{sortedHouses.length !== 1 ? "es" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-sm">
            {/* Searchbar text */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                placeholder="Search Nehosho, Senga, cottage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm bg-neutral-50/50 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 focus:bg-white transition-all"
              />
            </div>

            {/* Filter Suburb */}
            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm bg-white outline-none focus:border-blue-500 transition-all font-medium text-neutral-700"
              >
                <option value="All">All Areas / Suburbs</option>
                {uniqueLocations.filter(loc => loc !== "All").map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Filter Room Type */}
            <div>
              <select
                value={selectedRoomClass}
                onChange={(e) => setSelectedRoomClass(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm bg-white outline-none focus:border-blue-500 transition-all font-medium text-neutral-700"
              >
                <option value="All">All Room Variations</option>
                {uniqueRoomClasses.filter(c => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Sort Metric */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-neutral-200 text-xs sm:text-sm bg-white outline-none focus:border-blue-500 transition-all font-semibold text-neutral-700"
              >
                <option value="dist-main">Sort: Closest to Main Campus</option>
                <option value="dist-batanai">Sort: Closest to Batanai Campus</option>
                <option value="dist-telone">Sort: Closest to TelOne Campus</option>
                <option value="price-low">Sort: Lowest Price First</option>
                <option value="price-high">Sort: Highest Price First</option>
              </select>
              <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
            </div>
          </div>
        </div>

        {/* Informative Step banner */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-600 text-white p-4 sm:p-5 rounded-2xl shadow-xs border border-blue-500 space-y-1.5 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Step 1</span>
            <h4 className="font-extrabold text-sm sm:text-base">List houses & compare</h4>
            <p className="text-[11px] text-blue-100/90 leading-relaxed font-light">
              Filter by location suburb (Senga, Nehosho) or price and check physical distance calculations matching your MSU study campus perfectly.
            </p>
          </div>

          <div className="bg-white border border-blue-150 p-4 sm:p-5 rounded-2xl shadow-xs space-y-1.5 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Step 2</span>
            <h4 className="font-extrabold text-sm sm:text-base text-blue-900">Sign Up & Select Slots</h4>
            <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
              Fill the reservation card. Our dynamic billing automatically breaks down your monthly room rent and the required <span className="font-black text-blue-700">$20 USD agent securing fee</span> per head.
            </p>
          </div>

          <div className="bg-white border border-blue-150 p-4 sm:p-5 rounded-2xl shadow-xs space-y-1.5 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Step 3</span>
            <h4 className="font-extrabold text-sm sm:text-base text-blue-900">Redirect & WhatsApp</h4>
            <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
              Submit the booking. Your phone will open WhatsApp instantly with the agent message pre-formulated so you can secure keys without delays!
            </p>
          </div>
        </div>

        {/* Core Accommodation Gallery Listings Grid */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-neutral-900 tracking-tight">Vetted Student Boarding Houses</h3>
              <p className="text-xs text-neutral-400">Showing accommodations closest to your campus by default. Vetted and monitored.</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl border border-neutral-100 p-5 space-y-4 animate-pulse">
                  <div className="bg-neutral-100 h-48 rounded-2xl w-full" />
                  <div className="space-y-2">
                    <div className="bg-neutral-100 h-5 rounded w-2/3" />
                    <div className="bg-neutral-100 h-4 rounded w-1/2" />
                  </div>
                  <div className="pt-4 flex justify-between">
                    <div className="bg-neutral-100 h-8 rounded w-1/4" />
                    <div className="bg-neutral-100 h-8 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedHouses.length === 0 ? (
            <div className="bg-white border border-neutral-100 rounded-3xl p-16 text-center space-y-4 max-w-xl mx-auto shadow-sm">
              <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto">
                <Search size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-neutral-800">No Accommodations Found</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto leading-normal">
                  Try clearing your search query or choosing "All Areas/Room Variations" to view standard Gweru listings.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLocation("All");
                  setSelectedRoomClass("All");
                }}
                className="bg-blue-600 text-white rounded-xl py-2 px-4 shadow-sm text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedHouses.map((house) => (
                <HouseCard
                  key={house.id}
                  house={house}
                  onBookNow={(selected) => setSelectedHouseForBooking(selected)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Booking Form Modal Trigger */}
      {selectedHouseForBooking && (
        <BookingFormModal
          house={selectedHouseForBooking}
          isOpen={true}
          onClose={() => setSelectedHouseForBooking(null)}
          onBookingSubmit={handleBookingSubmit}
        />
      )}

      {/* Admin Panel Gateway Panel Trigger */}
      {isAdminOpen && (
        <AdminDashboard
          houses={houses}
          bookings={bookings}
          onAddHouse={handleAddHouse}
          onEditHouse={handleEditHouse}
          onDeleteHouse={handleDeleteHouse}
          onDeleteBooking={handleDeleteBooking}
          onDeleteAllBookings={handleDeleteAllBookings}
          onToggleBookingCompleted={handleToggleBookingCompleted}
          onClose={() => setIsAdminOpen(false)}
          onAddBooking={handleBookingSubmit}
        />
      )}

      {/* Site Footer */}
      <footer className="bg-blue-950 text-white border-t border-blue-900 pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4 col-span-1 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm">
                  D
                </div>
                <span className="font-black text-lg text-white tracking-tight">DOPES OFF-CAMPUS (REZ) HOUSING</span>
              </div>
              <p className="text-xs text-blue-200/80 leading-relaxed max-w-sm">
                Providing transparent campus proximity calculations, direct WhatsApp booking, beautifully managed layouts, and secure vetted parameters for student living.
              </p>
              <div className="text-xs bg-blue-900/60 rounded-xl p-3 border border-blue-900 max-w-sm leading-relaxed text-blue-100">
                ⚠️ <span className="font-bold">Important Notice:</span> A securing agent fee of <span className="font-extrabold underline text-white">$20 USD per head</span> is strictly charged. Securing holds your spot so you avoid missing room space at the start of semester!
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-300">Popular Study Suburbs</h4>
              <ul className="text-xs text-blue-200/80 space-y-2 font-medium">
                <li>• Nehosho Area (Closest to Main Campus Study)</li>
                <li>• Senga Area 1 & 2 (Quick walking path)</li>
                <li>• Windsor Park (Premium Quiet Suburb)</li>
                <li>• Daylesford Green Area (Large gardens & study zones)</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-300">Quick Contact</h4>
              <div className="text-xs text-blue-200/80 space-y-2.5">
                <p>📍 Gweru, Zimbabwe (Direct Support Desk)</p>
                <p className="flex items-center gap-1.5 font-bold text-white">
                  📞 Phone: <a href="tel:+263780736072" className="underline hover:text-blue-300">+263780736072</a>
                </p>
                <p className="flex items-center gap-1.5 font-bold text-emerald-400">
                  💬 WhatsApp: <a href="https://api.whatsapp.com/send?phone=263780736072" className="underline hover:text-white" target="_blank" rel="noreferrer">+263 780 736 072</a>
                </p>
                <div className="pt-2">
                  <span className="bg-white/10 select-none text-[10px] uppercase font-bold text-blue-100 px-2 py-1 rounded">
                    SECURED OFF-CAMPUS REZ HOUSING
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-blue-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-blue-300">
            <div className="space-y-1 md:max-w-2xl">
              <p>© {new Date().getFullYear()} DOPES Student Rooms Portal. Gweru, Zimbabwe.</p>
              <p className="text-[11px] text-blue-400/95 leading-relaxed font-medium">
                Not affiliated with Midlands State University (MSU), but this platform helps you secure quality student accommodation close to campus safely and easily.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 pt-2 sm:pt-0">
              <button 
                onClick={() => setIsAdminOpen(true)}
                className="hover:text-white text-xs underline cursor-pointer"
              >
                Access Admin Portal
              </button>
              <span>•</span>
              <span>Built with Professional Pride</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
