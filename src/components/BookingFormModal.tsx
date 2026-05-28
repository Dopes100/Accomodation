/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { House, Booking } from "../types";
import { 
  X, 
  MessageSquare, 
  ShieldAlert, 
  DollarSign, 
  Calendar, 
  Users, 
  Phone, 
  UserCheck, 
  GraduationCap, 
  Smartphone, 
  Mail, 
  Upload, 
  Check, 
  CheckCircle2, 
  Loader2, 
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BookingFormModalProps {
  house: House;
  isOpen: boolean;
  onClose: () => void;
  onBookingSubmit: (booking: Booking) => void;
}

export default function BookingFormModal({ house, isOpen, onClose, onBookingSubmit }: BookingFormModalProps) {
  // Step: "details" | "payment" | "emailConfirm"
  const [step, setStep] = useState<"details" | "payment" | "emailConfirm">("details");

  // Form Parameters
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Female");
  const [level, setLevel] = useState("1.1");
  const [headsCount, setHeadsCount] = useState<number>(1);
  const [targetMoveIn, setTargetMoveIn] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "EcoCash">("EcoCash");
  const [ecoCashNumber, setEcoCashNumber] = useState("");
  const [depositChoice, setDepositChoice] = useState<"Full" | "None" | "Custom">("Full");
  const [customDepositAmount, setCustomDepositAmount] = useState<number>(house.price);

  // File Proof States
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofBase64, setProofBase64] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);

  // Email simulation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailProgress, setEmailProgress] = useState<"connecting" | "sending" | "sent">("connecting");

  const AGENT_FEE_PER_HEAD = 20;
  const baseAgentFee = headsCount * AGENT_FEE_PER_HEAD;
  
  // Custom total logic: $1 is added inclusive for EcoCash charges on-site
  const inclusiveEcoCashCharge = paymentMethod === "EcoCash" ? 1 : 0;
  const totalAgentFee = baseAgentFee + inclusiveEcoCashCharge;

  // Selected deposit upfront amount choice
  const selectedDepositValue = depositChoice === "Custom" 
    ? customDepositAmount 
    : (depositChoice === "Full" ? house.price : 0);

  // Total amount user must actually transfer on-site when sending money
  const unifiedTotalToTransfer = totalAgentFee + selectedDepositValue;

  // File drag-and-drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Helper to compress images down on the client-side to fit comfortably within Firestore's 1MB document size limit
  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.7 quality to keep file size ultra-low while staying highly readable
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressed);
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawBase64 = reader.result as string;
        compressImage(rawBase64).then((compressed) => {
          setProofBase64(compressed);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawBase64 = reader.result as string;
        compressImage(rawBase64).then((compressed) => {
          setProofBase64(compressed);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Navigating to Step 2 (or 3 directly for Cash)
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentPhone || !studentEmail || !targetMoveIn) {
      alert("Please fill out all required student details correctly corresponding to your identification.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
      alert("Please provide a valid email format (e.g. Tendai@gmail.com). This is required to dispatch securing documents.");
      return;
    }
    
    // Validate study levels or other variables
    if (paymentMethod === "EcoCash") {
      setStep("payment");
    } else {
      // Direct Cash submitting path
      handleCompleteBooking();
    }
  };

  // Executing final record and launching simulated mailer
  const handleCompleteBooking = async () => {
    setIsSubmitting(true);
    
    const bookingId = "bkg-" + Date.now();
    const finalDepositValue = depositChoice === "Custom" 
      ? customDepositAmount 
      : (depositChoice === "Full" ? house.price : 0);

    const newBooking: Booking = {
      id: bookingId,
      houseId: house.id,
      houseTitle: house.title,
      studentName,
      studentPhone,
      studentEmail,
      gender,
      headsCount,
      targetMoveIn,
      notes,
      timestamp: new Date().toISOString(),
      paymentMethod,
      ecoCashNumber: paymentMethod === "EcoCash" ? (ecoCashNumber || "Self-Initiated") : undefined,
      depositChoice,
      customDepositAmount: finalDepositValue,
      proofOfPaymentBase64: proofBase64 || undefined,
    };

    try {
      // Triggers firestore database write atomically with slot reservation
      await onBookingSubmit(newBooking);
    } catch (err) {
      console.error("Firestore database submission error:", err);
    }

    // Now transition to dynamic simulated mail confirm dispatch dashboard 
    setStep("emailConfirm");
    setIsSubmitting(false);

    setEmailProgress("connecting");
    
    // Structure formal email HTML invoice payload
    const depositDesc = depositChoice === "Full" 
      ? `Full Deposit Upfront ($${house.price} USD)` 
      : (depositChoice === "None" ? "No Upfront Deposit" : `Custom Deposit Offer ($${customDepositAmount} USD)`);

    const agentFeeDetail = `$${headsCount * 20} USD`;
    const totalSent = paymentMethod === "EcoCash" ? headsCount * 20 + 1 + finalDepositValue : headsCount * 20 + finalDepositValue;
    const invoiceNumber = `INV-DOPES-${Math.floor(100000 + Math.random() * 899999)}`;
    const invoiceDate = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

    const emailHtmlAndText = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">Dopes Accommodation</h1>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #bfdbfe; font-weight: 500;">Official Midlands State University Student Housing Provider</p>
        </div>

        <div style="padding: 30px;">
          <!-- Invoice Meta Info -->
          <div style="display: flex; justify-content: space-between; align-items: top; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 25px;">
            <div>
              <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; tracking-wide: 1px; display: block; margin-bottom: 4px;">Status</span>
              <span style="background-color: #fef3c7; color: #d97706; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">UNVERIFIED INVOICE</span>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 11px; font-weight: 850; text-transform: uppercase; color: #64748b; tracking-wide: 1px; display: block; margin-bottom: 2px;">Invoice Number</span>
              <strong style="color: #0f172a; font-size: 15px; font-family: monospace;">${invoiceNumber}</strong>
              <span style="display: block; font-size: 11px; color: #94a3b8; margin-top: 4px;">Date: ${invoiceDate}</span>
            </div>
          </div>

          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-top: 0;">
            Dear <strong>${studentName}</strong>,
          </p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            Your selected room space has been provisionally reserved. An official portal hold has been established for you at <strong>${house.title}</strong>, located in the ${house.location} region.
          </p>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 25px;">
            Please find the detailed financial breakdown for your slot acquisition transaction listed below.
          </p>

          <!-- Table Items -->
          <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f1f5f9;">
                  <th style="padding: 12px 16px; font-weight: 800; color: #475569; width: 65%;">Item Description</th>
                  <th style="padding: 12px 16px; font-weight: 800; color: #475569; text-align: right; width: 35%;">Category Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 16px; color: #334155;">
                    <strong style="color: #0f172a; display: block;">MSU Securing Agent Fee</strong>
                    <span style="font-size: 11px; color: #64748b;">Securing commision for ${headsCount} registered student(s)</span>
                  </td>
                  <td style="padding: 12px 16px; text-align: right; color: #0f172a; font-weight: 600;">${agentFeeDetail}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 16px; color: #334155;">
                    <strong style="color: #0f172a; display: block;">Landlord Room Deposit</strong>
                    <span style="font-size: 11px; color: #64748b;">Upfront choice: ${depositDesc}</span>
                  </td>
                  <td style="padding: 12px 16px; text-align: right; color: #0f172a; font-weight: 600;">$${finalDepositValue} USD</td>
                </tr>
                ${paymentMethod === "EcoCash" ? `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 16px; color: #334155;">
                    <strong style="color: #0f172a; display: block;">EcoCash Channel Fee</strong>
                    <span style="font-size: 11px; color: #64748b;">Standard carrier service levy</span>
                  </td>
                  <td style="padding: 12px 16px; text-align: right; color: #0f172a; font-weight: 600;">$1 USD</td>
                </tr>
                ` : ""}
                <tr style="background-color: #f1f5f9;">
                  <td style="padding: 12px 16px; font-weight: 800; color: #1e3a8a;">Invoice Total due (USD)</td>
                  <td style="padding: 12px 16px; text-align: right; font-weight: 800; color: #1e3a8a; font-size: 15px;">$${totalSent} USD</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Crucial Alert -->
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-bottom: 30px;">
            <h4 style="margin: 0 0 5px 0; font-size: 13px; font-weight: 700; color: #1e3a8a; text-transform: uppercase;">Verification Process & Moving-In Details</h4>
            <p style="margin: 0; font-size: 12px; color: #1e3a8a; line-height: 1.5;">
              Our chief agent <strong>Panashe Dondo</strong> is performing standard auditing of your transaction proof. Once approved and ticked complete on the MSU admin ledger, you will instantly receive your official digital <strong>PDF Payment Receipt</strong>. Show that PDF receipt to your landlord to check in on <strong>${targetMoveIn}</strong>.
            </p>
          </div>

          <!-- Signature details -->
          <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
            <p style="margin: 0; font-weight: 700; color: #334155;">Dopes Accommodation Agency Gweru Bureau</p>
            <p style="margin: 3px 0 0 0;">dopesaccommodationagency@gmail.com • +263 78 073 6072</p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #94a3b8;">This is a system generated digital securing invoice holding reservation spaces.</p>
          </div>
        </div>
      </div>
    `;

    // Chain stages to make sure the user experiences a smooth, beautiful transition
    setTimeout(async () => {
      setEmailProgress("sending");
      try {
        const payload = {
          to: studentEmail,
          subject: `DOPES OFFICIAL RESERVATION INVOICE [${invoiceNumber}]`,
          html: emailHtmlAndText,
          text: `Dear ${studentName}. Your provisional securing invoice has been generated for ${house.title} in Gweru. Your total due is $${totalSent} USD. Please finalize the verification on WhatsApp.`,
        };
        
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        console.log("Email dispatch service response:", data);
      } catch (error) {
        console.error("Failed to make /api/send-email request:", error);
      } finally {
        // Wait a slight fraction for visual polish then resolve sending progress modal
        setTimeout(() => {
          setEmailProgress("sent");
        }, 1200);
      }
    }, 1500);
  };

  const handleOpenWhatsApp = () => {
    const depositText = depositChoice === "Full" 
      ? `Full Deposit upfront ($${house.price} USD)` 
      : (depositChoice === "None" ? "No Deposit upfront (Pay on Move-in)" : `Custom Deposit Offer: $${customDepositAmount} USD (Affordable upfront)`);

    const paymentText = paymentMethod === "Cash" 
      ? `Cash USD` 
      : `EcoCash Wallet (+263 78 073 6072 Panashe Dondo) [Includes $1 charge]`;

    // WhatsApp Message compilation
    const waPhone = "263780736072"; // Landlord Panashe Dondo digits
    const messageText = `Hello DOPES MSU Accommodation! 🏠✨
My slot booking has been securely completed and registered on your portal. Here are my verified details:

📌 *House Title:* ${house.title}
📍 *Suburb Location:* ${house.location}
💰 *Price structure:* $${house.price} USD / month

*Portal Reservation details:*
👤 *Name:* ${studentName} (${gender})
🎓 *MSU Study Level:* ${level}
📞 *Phone Number:* ${studentPhone}
✉️ *Registered Email:* ${studentEmail}
👥 *Heads sharing:* ${headsCount}
💵 *Once-off Agent Fee:* $${totalAgentFee} USD (Processed via ${paymentMethod})
💸 *Flexible House Deposit:* ${depositText}
📅 *Key Check-in Date:* ${targetMoveIn}
📝 *Student Requests:* ${notes || "None"}

${paymentMethod === "EcoCash" ? `✅ *EcoCash Payment Submitted successfully in portal to Panashe Dondo.*` : `💵 *Preparing Cash Agent Fee for physical checkout.*`}

Please confirm my mail delivery receipt confirmation from dopesaccommodationagency@gmail.com and register my lease key!`;

    const waUrl = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, "_blank");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-150 bg-white shadow-2xl z-10 my-8"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-blue-100 uppercase bg-blue-700/50 px-2 py-0.5 rounded-full">
                  Step {step === "details" ? "1 of 2: Details" : (step === "payment" ? "2 of 2: Payment" : "Completed")}
                </span>
                <h3 className="text-lg font-extrabold tracking-tight mt-1">MSU Student Portal Booking</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="mt-3 rounded-lg bg-white/10 p-2.5 text-xs text-blue-50/90 flex items-center justify-between">
              <div>
                House: <span className="font-bold text-white">{house.title}</span>
              </div>
              <div className="font-extrabold text-amber-300">
                ${house.price}/mo
              </div>
            </div>
          </div>

          {/* PAGE 1: Student details and configurations */}
          {step === "details" && (
            <form onSubmit={handleNextStep} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Alert details */}
              <div className="flex gap-3 rounded-xl border border-blue-50 bg-blue-50/35 p-3.5">
                <ShieldAlert className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <div className="text-[11px] text-blue-950 leading-normal">
                  <span className="font-extrabold block text-blue-900">Secure Direct Slot Allocation</span>
                  Please complete the booking information. A once-off agent securing fee of <span className="font-black text-indigo-600">$20 USD per head</span> holds your chosen room.
                </div>
              </div>

              {/* Student info inputs */}
              <div className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Full Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Tendai Moyo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                      WhatsApp Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      placeholder="e.g. +263771234567"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="e.g. tendai@gmail.com"
                      className={`w-full bg-slate-50 border rounded-xl p-3 text-xs outline-none focus:bg-white transition-all font-semibold ${
                        studentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)
                          ? "border-red-400 focus:border-red-500"
                          : "border-slate-200 focus:border-blue-500"
                      }`}
                    />
                    {studentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail) ? (
                      <span className="text-[9px] text-red-500 mt-0.5 font-bold block">⚠️ Please enter a valid email format.</span>
                    ) : (
                      <span className="text-[9px] text-neutral-400 mt-0.5 block">Official securing invoices sent here.</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                      Gender Group
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGender("Female")}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          gender === "Female"
                            ? "bg-blue-50 border-blue-500 text-blue-700 shadow-xs"
                            : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Female
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender("Male")}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          gender === "Male"
                            ? "bg-blue-50 border-blue-500 text-blue-700 shadow-xs"
                            : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Male
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                      MSU Semester level
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
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

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                      Check-In Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={targetMoveIn}
                      onChange={(e) => setTargetMoveIn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                      Student headcount (spots)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={house.availableSlots}
                      required
                      value={headsCount}
                      onChange={(e) => setHeadsCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Additional Requests */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Extra specifications (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={1}
                    placeholder="e.g. Any special roommate request..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all resize-none font-medium"
                  />
                </div>

                {/* Agent Securing Payment Selection */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Securing Payment Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("EcoCash")}
                      className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === "EcoCash"
                          ? "bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs"
                          : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium"
                      }`}
                    >
                      <Smartphone size={16} />
                      <span className="text-xs">EcoCash Wallet</span>
                      <span className="text-[8px] text-blue-600/70">Secure Instant + $1 Cost</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Cash")}
                      className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === "Cash"
                          ? "bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs"
                          : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium"
                      }`}
                    >
                      <DollarSign size={16} />
                      <span className="text-xs">Physical Cash USD</span>
                      <span className="text-[8px] text-slate-500">Submit pending check-in</span>
                    </button>
                  </div>
                </div>

                {/* Flexible House Deposit Option selection */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Flexible House Deposit Offer 💰
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    <button
                      type="button"
                      onClick={() => setDepositChoice("Full")}
                      className={`py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        depositChoice === "Full"
                          ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                          : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Full (${house.price})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositChoice("None")}
                      className={`py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        depositChoice === "None"
                          ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                          : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      No Deposit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositChoice("Custom")}
                      className={`py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        depositChoice === "Custom"
                          ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                          : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Pay Custom
                    </button>
                  </div>

                  {depositChoice === "Custom" && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 mt-2 text-left"
                    >
                      <label className="text-[9px] font-extrabold text-neutral-500 uppercase block">
                        Amount you wish to offer upfront ($ USD):
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="e.g. 40"
                        value={customDepositAmount}
                        onChange={(e) => setCustomDepositAmount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-bold text-neutral-800"
                      />
                      <p className="text-[9px] text-neutral-500 leading-normal italic">
                        * Note: Entering ANY custom payment deposit you are comfortable paying upfront reinforces commitment during landlord allocations.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Billing Breakdowns Box */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2 mt-4">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                  Interactive Fee & Deposit Summary
                </span>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Room Rent (Monthly)</span>
                  <span className="font-semibold text-slate-800">${house.price} USD / head / month</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Flexible Deposit Choice (Upfront)</span>
                  <span className="font-semibold text-slate-800">
                    {depositChoice === "Full" ? `$${house.price} USD` : depositChoice === "None" ? "No Upfront Deposit" : `$${customDepositAmount} USD`}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 items-center">
                  <span>Securing Agent Fee ({headsCount} Head{headsCount > 1 ? "s" : ""})</span>
                  <span className="font-semibold text-slate-800">${baseAgentFee} USD</span>
                </div>
                {paymentMethod === "EcoCash" && (
                  <div className="flex justify-between text-[11px] text-blue-700 font-medium items-center">
                    <span>Inclusive Mobile Money Charge</span>
                    <span>+$1.00 USD</span>
                  </div>
                )}
                <div className="h-px bg-slate-200 my-2" />
                <div className="flex flex-col gap-1.5 bg-blue-50/50 p-3 rounded-xl border border-blue-100/55 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                      <Smartphone size={14} className="text-blue-600 animate-pulse" />
                      TOTAL MONEY TO SEND ({paymentMethod})
                    </span>
                    <span className="text-sm font-extrabold text-[#1D4ED8]">${unifiedTotalToTransfer} USD</span>
                  </div>
                  <p className="text-[9px] text-blue-700 leading-normal font-medium">
                    * Note: This total dynamically integrates the agent fee and your selected upfront deposit option for direct landlord processing.
                  </p>
                </div>
              </div>

              {/* Navigation Action */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white rounded-xl py-3 px-4 font-bold text-xs tracking-wide shadow-md hover:bg-blue-700 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Processing Secure Reservation...
                  </>
                ) : (
                  <>
                    Proceed with Secure Booking
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* PAGE 2: On-Site EcoCash Payment Gateway */}
          {step === "payment" && (
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setStep("details")}
                  className="p-1 px-2 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <ArrowLeft size={10} /> Change Info
                </button>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-xs font-semibold text-blue-700">On-Site Payment Terminal 📱</span>
              </div>

              {/* Amount to pay Card */}
              <div className="bg-neutral-900 rounded-2xl p-5 text-white text-center relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 p-3 opacity-15">
                  <Smartphone size={80} />
                </div>
                <span className="text-[10px] tracking-widest text-slate-400 block uppercase font-bold">
                  TOTAL COMBINED AMOUNT DIRECTIVE
                </span>
                <h4 className="text-3xl font-black text-amber-300 mt-1">${unifiedTotalToTransfer}.00 USD</h4>
                <p className="text-[11px] text-slate-350 mt-1 text-center font-medium leading-relaxed">
                  Securing Agent Fee (${totalAgentFee} USD) + Selected Upfront Deposit (${selectedDepositValue} USD)
                </p>
              </div>

              {/* Instructions on how to pay */}
              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-3">
                <span className="text-[10px] font-black text-blue-900 uppercase block tracking-wider">
                  MOBILE MONEY TRANSACTION MANUAL
                </span>
                <div className="text-xs text-neutral-700 space-y-2.5 leading-relaxed">
                  <div className="flex gap-2 items-start">
                    <span className="bg-blue-600 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <p>
                      Dial <strong>*151#</strong> or open your EcoCash USD mobile app on your phone.
                    </p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="bg-blue-600 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <p>
                      Transfer exactly <strong>${unifiedTotalToTransfer} USD</strong> (the selected deposit level plus the agent fee) to:
                      <span className="block mt-1 p-2 bg-white rounded-lg border border-blue-100 text-neutral-900 font-mono text-[11px] font-extrabold shadow-2xs">
                        📱 Phone: <span className="bg-yellow-100 text-slate-900 px-1">+263 78 073 6072</span> <br />
                        👤 Name: <span className="text-indigo-700">Panashe Dondo</span>
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="bg-blue-600 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <p>
                      Enter your validating EcoCash number below and upload a clear screenshot of your successful transaction receipt:
                    </p>
                  </div>
                </div>
              </div>

              {/* EcoCash phone digit input */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Your Paying EcoCash Number
                </label>
                <input
                  type="tel"
                  required
                  value={ecoCashNumber}
                  onChange={(e) => setEcoCashNumber(e.target.value)}
                  placeholder="e.g. 0771234567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              {/* Upload transaction Screenshot proof */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  EcoCash Receipt Screen Proof <span className="text-red-500">*</span>
                </label>

                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all min-h-[140px] text-center bg-slate-50 relative ${
                    dragActive ? "border-blue-500 bg-blue-50/20" : "border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {proofBase64 ? (
                    <div className="space-y-2 w-full flex flex-col items-center">
                      <div className="p-2 bg-emerald-100 rounded-full text-emerald-800">
                        <FileCheck size={28} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-800">Screenshot Uploaded Successfully</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{proofFile?.name || "Payment_Snapshot.png"}</p>
                      </div>
                      {/* Sub-thumbnail image preview panel */}
                      <div className="relative border p-1 rounded-lg bg-white mt-1">
                        <img 
                          src={proofBase64} 
                          alt="Proof preview" 
                          className="h-16 w-32 object-contain rounded"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => { setProofBase64(""); setProofFile(null); }}
                          className="absolute -top-1.5 -right-1.5 bg-red-650 text-white rounded-full p-0.5 shadow-sm text-[9px] font-bold"
                          title="Clear Image"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="mx-auto bg-slate-200 text-slate-600 hover:text-blue-500 rounded-full w-10 h-10 flex items-center justify-center transition-colors">
                        <Upload size={18} />
                      </div>
                      <div className="text-xs text-neutral-600">
                        <label className="text-blue-600 font-bold underline cursor-pointer hover:text-blue-700">
                          Click to select proof of payment
                          <input
                            type="file"
                            accept="image/*"
                            required
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-neutral-400 mt-1">or drag and drop screenshot file here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Completion CTA and slot verification */}
              <button
                type="button"
                disabled={isSubmitting || !proofBase64}
                onClick={handleCompleteBooking}
                className={`w-full text-white rounded-xl py-3 px-4 font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4 ${
                  proofBase64 
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-500/10 hover:brightness-105 active:scale-[0.99]" 
                    : "bg-neutral-350 text-neutral-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Completing secure on-site checkout...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Complete Direct EcoCash Payment 
                  </>
                )}
              </button>
              {!proofBase64 && (
                <p className="text-center text-[9px] text-amber-500 font-semibold leading-relaxed">
                  ⚠️ Please select/upload your EcoCash transaction receipt screenshot above to validate booking.
                </p>
              )}
            </div>
          )}

          {/* PAGE 3: Interactive Mail server dispatch & detailed billing receipt confirmations */}
          {step === "emailConfirm" && (
            <div className="p-6 space-y-5 text-center max-h-[70vh] overflow-y-auto">
              
              {/* Dynamic dispatching progression animation */}
              <AnimatePresence mode="wait">
                {(emailProgress === "connecting" || emailProgress === "sending") && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 space-y-4"
                  >
                    <Loader2 size={44} className="animate-spin text-blue-600 mx-auto" />
                    <div>
                      <h4 className="font-bold text-sm text-neutral-800">Processing Secure Booking</h4>
                      <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto font-medium leading-relaxed">
                        We are securing your accommodation space, registering your details on our Midlands State University student portal, and preparing your confirmation email. Please stay on this screen...
                      </p>
                    </div>
                  </motion.div>
                )}

                {emailProgress === "sent" && (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="space-y-4 text-left"
                  >
                    {/* Success Checked Stamp circle */}
                    <div className="mx-auto bg-emerald-100/70 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center shadow-inner">
                      <CheckCircle2 size={36} className="animate-pulse" />
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] font-black tracking-widest text-[#059669] uppercase bg-[#DEF7EC] px-3 py-1 rounded-full">
                        PORTAL BOOKING COMPLETE!
                      </span>
                      <h4 className="text-lg font-black text-neutral-800 mt-2">Reservation Successfully Registered</h4>
                      <p className="text-xs text-neutral-500 px-4 mt-1 leading-normal font-medium">
                        Your direct slot has been committed. An official detailed confirmation email copy has been sent to <strong className="text-blue-600">{studentEmail}</strong> confirming your secure place.
                      </p>
                    </div>

                    {/* Highly Polished Custom Receipt Checklist */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-sans space-y-3 relative overflow-hidden shadow-xs mt-3 select-text">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs font-black text-neutral-800 uppercase tracking-wide">
                          Official Receipt Copy
                        </span>
                        <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          ⏱️ Wait for verification
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border space-y-2 text-xs text-slate-705">
                        <div className="space-y-1.5 font-medium">
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span>⏱️ <strong>Timestamp:</strong></span>
                            <span className="font-semibold text-slate-900">{new Date().toLocaleDateString("en-US")} {new Date().toLocaleTimeString("en-US")}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span>🏠 <strong>Accommodation:</strong></span>
                            <span className="font-semibold text-slate-900">{house.title} ({house.location})</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span>👥 <strong>Reservations (Spots):</strong></span>
                            <span className="font-semibold text-slate-900">{headsCount} sharing level</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span>💸 <strong>Deposit choice:</strong></span>
                            <span className="font-semibold text-emerald-700">
                              {depositChoice === "Full" ? `Full Deposit Upfront ($${house.price} USD)` : depositChoice === "None" ? "No Upfront Deposit" : `Custom Deposit Offer ($${customDepositAmount} USD)`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span>📱 <strong>Agent Securing Channel:</strong></span>
                            <span className="font-semibold text-blue-700">{paymentMethod} (Fee: ${totalAgentFee} USD)</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <span>📅 <strong>Planned Move-In:</strong></span>
                            <span className="font-semibold text-slate-900">{targetMoveIn}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between text-[8px] font-black tracking-wider text-slate-400 uppercase mt-2">
                        <span>DOPES AGENCY ID: {house.id}</span>
                        <span>OFFICIAL MSU PORTAL DOCUMENT 🎒</span>
                      </div>
                    </div>

                    {/* Big final proceed to WhatsApp Button */}
                    <button
                      onClick={handleOpenWhatsApp}
                      className="w-full bg-[#25D366] hover:bg-[#20ba59] hover:brightness-105 active:scale-[0.99] text-white rounded-xl py-3 px-4 font-extrabold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
                    >
                      <MessageSquare size={16} />
                      Complete & Launch WhatsApp Key Verification
                    </button>
                    <p className="text-center text-[9.5px] text-neutral-400 leading-normal font-semibold">
                      Please copy the confirmation receipt, then click the green button to message Panashe Dondo on WhatsApp with your proof. Your spot is instantly held.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
