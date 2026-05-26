/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { House, Booking } from "../types";
import { 
  Wifi, 
  MapPin, 
  Home, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  User, 
  Activity, 
  Percent, 
  DoorOpen,
  DollarSign
} from "lucide-react";
import DistanceGrid from "./DistanceGrid";

interface HouseCardProps {
  house: House;
  onBookNow: (house: House) => void;
}

export default function HouseCard({ house, onBookNow }: HouseCardProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showDistances, setShowDistances] = useState(false);

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev === 0 ? house.images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev === house.images.length - 1 ? 0 : prev + 1));
  };

  // Gender Color Schemes
  const getGenderBadgeClass = (gender: typeof house.genderLimit) => {
    switch (gender) {
      case "Female Only":
        return "bg-pink-50 text-pink-700 border-pink-100";
      case "Male Only":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
  };

  // Icon resolver for house conveniences
  const renderFeatureIcon = (feature: string) => {
    const norm = feature.toLowerCase();
    if (norm.includes("wi-fi") || norm.includes("internet")) return <Wifi size={13} className="text-blue-500" />;
    if (norm.includes("borehole") || norm.includes("water")) return <Activity size={13} className="text-blue-500 animate-pulse" />;
    if (norm.includes("solar") || norm.includes("backup")) return <Sparkles size={13} className="text-amber-500" />;
    return <CheckCircle2 size={13} className="text-blue-600" />;
  };

  const isFull = house.availableSlots === 0;
  const slotProgressPercent = Math.min(100, (house.availableSlots / house.maxSlots) * 100);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xs hover:shadow-xl hover:border-blue-100 transition-all duration-300">
      {/* Image Gallery Container */}
      <div className="relative h-60 w-full overflow-hidden bg-neutral-900">
        <img
          src={house.images[currentImageIdx]}
          alt={house.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-neutral-950/70 to-transparent" />

        {/* Price Tag */}
        <div className="absolute top-4 left-4 bg-white px-3.5 py-1.5 rounded-xl shadow-lg border border-neutral-100 flex items-center">
          <span className="text-xs font-title font-bold text-neutral-500 uppercase mr-1">USD</span>
          <span className="text-lg font-black text-blue-700 font-sans tracking-tight">${house.price}</span>
          <span className="text-[10px] text-neutral-400 font-semibold ml-1">/ mo</span>
        </div>

        {/* Gender Requirement Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-xl shadow-md border border-white/60">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${getGenderBadgeClass(house.genderLimit)} px-1.5 py-0.5 rounded-md`}>
            <User size={10} />
            {house.genderLimit}
          </span>
        </div>

        {/* Image Nav Arrows (if > 1 image exists) */}
        {house.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 text-neutral-800 hover:bg-white border border-neutral-200 backdrop-blur-xs transition-colors shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 text-neutral-800 hover:bg-white border border-neutral-200 backdrop-blur-xs transition-colors shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {house.images.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentImageIdx ? "w-4 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col space-y-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-semibold uppercase tracking-wider">
            <MapPin size={12} className="text-blue-500" />
            <span>{house.location}</span>
          </div>

          <h3 className="font-sans font-bold text-lg text-neutral-900 leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
            {house.title}
          </h3>
        </div>

        <p className="text-xs text-neutral-500 leading-relaxed font-sans line-clamp-2 md:line-clamp-3">
          {house.description}
        </p>

        {/* Dynamic availability slot bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
            <span className="flex items-center gap-1">
              <DoorOpen size={13} className="text-blue-600" /> Availability Status
            </span>
            <span className={isFull ? "text-red-500" : "text-blue-700 animate-pulse"}>
              {isFull ? "Fully Booked" : `${house.availableSlots} of ${house.maxSlots} spaces left!`}
            </span>
          </div>
          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull ? "bg-red-400" : slotProgressPercent < 30 ? "bg-amber-400" : "bg-blue-600"
              }`}
              style={{ width: `${slotProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Convenient features list */}
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          {house.features.map((feat) => (
            <span
              key={feat}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-100 bg-neutral-50/70 px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100/70 transition-colors"
            >
              {renderFeatureIcon(feat)}
              {feat}
            </span>
          ))}
        </div>

        {/* Toggle distance visualizer */}
        <div className="pt-2 border-t border-neutral-100">
          <button
            onClick={() => setShowDistances(!showDistances)}
            className="w-full flex items-center justify-between rounded-lg bg-blue-50/50 hover:bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition-all border border-blue-100/30"
          >
            <span>{showDistances ? "Hide MSU Distances" : "View Distance from MSU Campus"}</span>
            <span className="text-[10px] bg-white text-blue-600 py-0.5 px-2 rounded-md font-extrabold border border-blue-200">
              {house.distances.mainCampus} km to Main
            </span>
          </button>
        </div>

        {/* Collapsible Distance Grid */}
        {showDistances && (
          <div className="animate-fadeIn">
            <DistanceGrid distances={house.distances} />
          </div>
        )}

        {/* Action Button - Secure on Whatsapp */}
        <div className="pt-2">
          <button
            disabled={isFull}
            onClick={() => onBookNow(house)}
            className={`w-full font-bold text-xs tracking-wider uppercase rounded-xl py-3 px-4 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isFull
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] hover:shadow-lg hover:shadow-blue-600/10"
            }`}
          >
            <span>Secure This House Now</span>
            <span className="px-1.5 py-0.5 text-[9px] bg-blue-700 text-blue-50 rounded-md font-bold text-center">
              $20 Agent Fee
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
