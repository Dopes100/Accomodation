/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { House, Booking } from "../types";
import { X, MessageSquare, ShieldAlert, DollarSign, Calendar, Users, Phone, UserCheck, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BookingFormModalProps {
  house: House;
  isOpen: boolean;
  onClose: () => void;
  onBookingSubmit: (booking: Booking) => void;
}

export default function BookingFormModal({ house, isOpen, onClose, onBookingSubmit }: BookingFormModalProps) {
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Female");
  const [level, setLevel] = useState("1.1");
  const [headsCount, setHeadsCount] = useState<number>(1);
  const [targetMoveIn, setTargetMoveIn] = useState("");
  const [notes, setNotes] = useState("");
  
  const AGENT_FEE_PER_HEAD = 20;
  const totalAgentFee = headsCount * AGENT_FEE_PER_HEAD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentPhone || !targetMoveIn) return;

    // Create Booking object
    const bookingId = "bkg-" + Date.now();
    const newBooking: Booking = {
      id: bookingId,
      houseId: house.id,
      houseTitle: house.title,
      studentName,
      studentPhone,
      gender,
      headsCount,
      targetMoveIn,
      notes,
      timestamp: new Date().toISOString(),
    };

    // Callback to record booking on our state (persisted on localStorage for Admin)
    onBookingSubmit(newBooking);

    // Compose WhatsApp Text
    const waPhone = "263780736072"; // WhatsApp agent target phone
    const messageText = `Hello DOPES MSU Accommodation! 🏠✨
I would like to secure the following house:
📌 *House:* ${house.title}
📍 *Location:* ${house.location}
💰 *Price:* $${house.price}/month ($20 Agent Fee/head is charged)

*Booking Details:*
👤 *Name:* ${studentName} (${gender})
🎓 *MSU Study Level:* ${level}
📞 *Phone:* ${studentPhone}
👥 *Heads Count (People):* ${headsCount}
💵 *Agent Booking Fee:* $${totalAgentFee} ($20 per head)
📅 *Expected Move-in Date:* ${targetMoveIn}
📝 *Additional Notes:* ${notes || "None"}

Please confirm availability and help me complete my securing process on WhatsApp!`;

    // URI encode message
    const waUrl = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(messageText)}`;
    
    // Redirect to WhatsApp
    window.open(waUrl, "_blank");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-2xl z-10"
        >
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold tracking-wider text-blue-100 uppercase">
                  Secure Your Spot
                </span>
                <h3 className="text-lg font-bold tracking-tight">Booking Request Form</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-blue-700 p-1.5 text-blue-100 transition-colors hover:bg-blue-800"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="mt-3 rounded-lg bg-blue-700/50 p-2.5 text-xs text-blue-50">
              Selected: <span className="font-semibold">{house.title}</span> – <span className="underline">${house.price}/month</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Warning regarding Agent Fee */}
            <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <ShieldAlert className="text-blue-600 shrink-0" size={20} />
              <div className="text-xs text-blue-900 leading-normal">
                <span className="font-bold block text-blue-800">Agent Booking Fee Required</span>
                An agent securing fee of <span className="font-black">$20 USD per head</span> is charged. This allows us to hold and finalize your registration block immediately with the house landlord.
              </div>
            </div>

            {/* Student details */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Full Student Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tendai Moyo"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    WhatsApp Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +263771234567"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Level of Study
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-blue-500 transition-colors bg-white select-custom"
                  >
                    <option value="1.1">Level 1 Sem 1</option>
                    <option value="1.2">Level 1 Sem 2</option>
                    <option value="2.1">Level 2 Sem 1</option>
                    <option value="2.2">Level 2 Sem 2</option>
                    <option value="3.1">Level 3 (Work Placement)</option>
                    <option value="4.1">Level 4 Sem 1</option>
                    <option value="4.2">Level 4 Sem 2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender("Female")}
                      className={`py-2.5 rounded-lg text-xs font-bold border transition-all ${
                        gender === "Female"
                          ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Female
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("Male")}
                      className={`py-2.5 rounded-lg text-xs font-bold border transition-all ${
                        gender === "Male"
                          ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Male
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Heads Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={house.availableSlots}
                    required
                    value={headsCount}
                    onChange={(e) => setHeadsCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Expected Move-in Date
                </label>
                <input
                  type="date"
                  required
                  value={targetMoveIn}
                  onChange={(e) => setTargetMoveIn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Extra Requests (Optional)
                </label>
                <textarea
                  placeholder="e.g. I prefer close proximity to the water tank..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Billing Summary Box */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Billing Breakdowns
              </span>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Rooms Base Rent</span>
                <span className="font-semibold text-slate-800">${house.price} USD / month / head</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 items-center">
                <span>Securing Agent Fee (${AGENT_FEE_PER_HEAD} x {headsCount})</span>
                <span className="font-semibold text-slate-800">${totalAgentFee} USD (Once-off)</span>
              </div>
              <div className="h-px bg-slate-200 my-2" />
              <div className="flex justify-between items-center bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50">
                <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                  <DollarSign size={14} /> Cash Agent Fee Due
                </span>
                <span className="text-sm font-extrabold text-[#1D4ED8]">${totalAgentFee} USD</span>
              </div>
            </div>

            {/* CTA Securing on WhatsApp */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-xl py-3 px-4 font-bold text-sm tracking-wide shadow-md shadow-blue-500/10 hover:bg-blue-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <MessageSquare size={16} />
              Secure and Send to WhatsApp
            </button>
            <p className="text-center text-[10px] text-neutral-400">
              By clicking above, you will be redirected to WhatsApp to finish payment of the $20 fee and receive your landlord lease agreement key.
            </p>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
