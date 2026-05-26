/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HouseDistance } from "../types";
import { MapPin, Navigation, School } from "lucide-react";

interface DistanceGridProps {
  distances: HouseDistance;
}

export default function DistanceGrid({ distances }: DistanceGridProps) {
  // Proximity helper: gives a text assessment and Tailwind color classes
  const getProximityBadge = (km: number) => {
    if (km <= 0.5) {
      return {
        label: "Immediate Walk",
        color: "bg-emerald-50 text-emerald-700 border-emerald-100",
        indicator: "bg-emerald-500",
      };
    } else if (km <= 1.2) {
      return {
        label: "Walking Distance",
        color: "bg-blue-50 text-blue-700 border-blue-100",
        indicator: "bg-blue-500",
      };
    } else if (km <= 3.0) {
      return {
        label: "Short Ride / Bicycle",
        color: "bg-amber-50 text-amber-700 border-amber-100",
        indicator: "bg-amber-500",
      };
    } else {
      return {
        label: "Requires Shuttle",
        color: "bg-neutral-100 text-neutral-700 border-neutral-200",
        indicator: "bg-neutral-500",
      };
    }
  };

  const getTravelTimeStr = (km: number) => {
    const walkMins = Math.round(km * 12);
    if (walkMins <= 30) {
      return `~${walkMins} mins walk to campus`;
    } else {
      const driveMins = Math.max(2, Math.round(km * 2));
      return `~${driveMins} mins ride / ~${walkMins} mins walk`;
    }
  };

  const mainStats = getProximityBadge(distances.mainCampus);
  const batanaiStats = getProximityBadge(distances.batanai);
  const telOneStats = getProximityBadge(distances.telOne);

  return (
    <div className="space-y-3 rounded-xl border border-slate-100 bg-white p-4 shadow-xs">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-1">
        <Navigation size={13} className="text-blue-600 animate-pulse" />
        Campus Proximity Check
      </div>
      
      <div className="space-y-2.5">
        {/* Main Campus */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100/50 hover:border-blue-150 transition-colors">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <School size={16} className="text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Main Campus</span>
            </div>
            <span className="text-[10px] text-slate-400 pl-6 font-medium">
              {getTravelTimeStr(distances.mainCampus)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full border ${mainStats.color}`}>
              {mainStats.label}
            </span>
            <span className="text-sm font-bold text-blue-600">{distances.mainCampus} km</span>
          </div>
        </div>

        {/* Batanai Campus */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100/50 hover:border-blue-150 transition-colors">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Batanai Campus</span>
            </div>
            <span className="text-[10px] text-slate-400 pl-6 font-medium">
              {getTravelTimeStr(distances.batanai)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full border ${batanaiStats.color}`}>
              {batanaiStats.label}
            </span>
            <span className="text-sm font-bold text-blue-600">{distances.batanai} km</span>
          </div>
        </div>

        {/* TelOne Campus */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100/50 hover:border-blue-150 transition-colors">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <School size={16} className="text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">TelOne Campus</span>
            </div>
            <span className="text-[10px] text-slate-400 pl-6 font-medium">
              {getTravelTimeStr(distances.telOne)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full border ${telOneStats.color}`}>
              {telOneStats.label}
            </span>
            <span className="text-sm font-bold text-blue-600">{distances.telOne} km</span>
          </div>
        </div>
      </div>
    </div>
  );
}
