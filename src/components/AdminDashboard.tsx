/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { House, Booking } from "../types";
import { 
  Lock, 
  Plus, 
  Trash2, 
  Edit3, 
  LogOut, 
  ClipboardList, 
  Home, 
  ChevronDown, 
  Eye, 
  Check, 
  X, 
  Sparkles, 
  Users, 
  MapPin, 
  School,
  DollarSign,
  Coins,
  BarChart3,
  PlusCircle,
  Lightbulb,
  Clock,
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Settings
} from "lucide-react";

interface AdminDashboardProps {
  houses: House[];
  bookings: Booking[];
  onAddHouse: (house: House) => void;
  onEditHouse: (house: House) => void;
  onDeleteHouse: (id: string) => void;
  onDeleteBooking: (id: string) => void;
  onDeleteAllBookings?: () => void;
  onToggleBookingCompleted?: (id: string) => void;
  onClose: () => void;
  onAddBooking?: (booking: Booking) => void;
}

const PRESET_FEATURES = [
  "Wi-Fi",
  "Borehole Water",
  "Solar Backup",
  "Fitted Kitchen",
  "Durawalled",
  "Gated",
  "Hot Water Geyser",
  "Study Desks",
  "Caretaker",
  "Pristine Lawns",
  "Built-in Wardrobes",
  "Washing Machine"
];

const PRESET_ROOM_TYPES = [
  "Single Room",
  "Double Shared",
  "Cottage Room",
  "Boarding Hostel"
] as const;

export default function AdminDashboard({
  houses,
  bookings,
  onAddHouse,
  onEditHouse,
  onDeleteHouse,
  onDeleteBooking,
  onDeleteAllBookings,
  onToggleBookingCompleted,
  onClose,
  onAddBooking
}: AdminDashboardProps) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"listings" | "bookings" | "analytics" | "deposits">("listings");
  const [sendingPdfId, setSendingPdfId] = useState<string | null>(null);
  const [depositsSearchQuery, setDepositsSearchQuery] = useState("");
  
  // Custom dynamic SMTP settings for GMAIL
  const [smtpUser, setSmtpUser] = useState(() => localStorage.getItem("dopes_gmail_user") || "dopesaccommodationagency@gmail.com");
  const [smtpPass, setSmtpPass] = useState(() => localStorage.getItem("dopes_gmail_app_password") || "");
  const [showSmtpSettings, setShowSmtpSettings] = useState(false);
  
  // Manual offline booking state
  const [manualStudentName, setManualStudentName] = useState("");
  const [manualStudentPhone, setManualStudentPhone] = useState("");
  const [manualStudentGender, setManualStudentGender] = useState<"Male" | "Female">("Female");
  const [manualHouseId, setManualHouseId] = useState("");
  const [customHouseTitle, setCustomHouseTitle] = useState("Direct Client Placement (External)");
  const [manualHeadsCount, setManualHeadsCount] = useState(1);
  const [manualMoveInDate, setManualMoveInDate] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [manualSuccess, setManualSuccess] = useState(false);

  // House form state
  const [editingHouseId, setEditingHouseId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(90);
  const [location, setLocation] = useState("Nehosho");
  const [roomType, setRoomType] = useState<House["roomType"]>("Double Shared");
  const [genderLimit, setGenderLimit] = useState<House["genderLimit"]>("Mixed");
  const [mainCampusDist, setMainCampusDist] = useState<number>(0.8);
  const [batanaiDist, setBatanaiDist] = useState<number>(1.2);
  const [telOneDist, setTelOneDist] = useState<number>(5.0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["Wi-Fi", "Borehole Water"]);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [availableSlots, setAvailableSlots] = useState<number>(6);
  const [maxSlots, setMaxSlots] = useState<number>(12);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [previewBookingName, setPreviewBookingName] = useState<string>("");
  
  const [emailStatusModal, setEmailStatusModal] = useState<{
    show: boolean;
    success: boolean;
    simulated: boolean;
    title: string;
    message: string;
    booking?: Booking;
    warning?: string;
    details?: string;
    suggestion?: string;
  } | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (toast && toast.show) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Default select first house for manual booking if available
  React.useEffect(() => {
    if (houses.length > 0 && !manualHouseId) {
      setManualHouseId(houses[0].id);
    }
  }, [houses, manualHouseId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Dopes@07") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect password. Access denied!");
    }
  };

  const generateAndSendPDFReceipt = async (booking: Booking) => {
    try {
      setSendingPdfId(booking.id);
      
      const doc = new jsPDF();
      
      // Draw background decorations
      doc.setFillColor(30, 58, 138); // Deep blue (#1e3a8a)
      doc.rect(0, 0, 210, 35, "F");
      
      // Brand Header text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text("DOPES ACCOMMODATION AGENCY", 15, 18);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(226, 232, 240);
      doc.text("Secure Off-Campus Student Housing & Booking Platform", 15, 24);
      doc.text("Gweru, Zimbabwe | dopesaccommodationagency@gmail.com", 15, 29);
      
      // Document title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text("OFFICIAL RECEIPT & LEASE PERMISSION", 15, 48);
      
      // Status Stamp Box
      doc.setDrawColor(16, 185, 129); // emerald Green stamp border
      doc.setFillColor(240, 253, 250); // emerald bg
      doc.rect(142, 40, 53, 22, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(16, 185, 129);
      doc.text("VERIFIED PAID", 153, 49);
      doc.setFontSize(8);
      doc.setTextColor(5, 150, 105);
      doc.text("Panashe Dondo Audited", 147, 54);
      doc.text("Online Portal Record ✅", 147, 58);
      
      // Metadata Details block (Left column)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text("PAYER / STUDENT DETAILS", 15, 68);
      
      doc.setFont("helvetica", "bold");
      doc.text("Name:", 15, 75);
      doc.setFont("helvetica", "normal");
      doc.text(booking.studentName, 42, 75);
      
      doc.setFont("helvetica", "bold");
      doc.text("Phone:", 15, 81);
      doc.setFont("helvetica", "normal");
      doc.text(booking.studentPhone, 42, 81);
      
      doc.setFont("helvetica", "bold");
      doc.text("Email:", 15, 87);
      doc.setFont("helvetica", "normal");
      doc.text(booking.studentEmail || "Not Provided", 42, 87);
      
      doc.setFont("helvetica", "bold");
      doc.text("Gender Group:", 15, 93);
      doc.setFont("helvetica", "normal");
      doc.text(booking.gender, 42, 93);
      
      // Receipt Details block (Right column)
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("TRANSACTION METADATA", 115, 68);
      
      doc.setFont("helvetica", "bold");
      doc.text("Receipt ID:", 115, 75);
      doc.setFont("helvetica", "normal");
      doc.text(`REC-${booking.id.toUpperCase()}`, 142, 75);
      
      doc.setFont("helvetica", "bold");
      doc.text("Date Paid:", 115, 81);
      doc.setFont("helvetica", "normal");
      doc.text(new Date().toLocaleDateString(), 142, 81);
      
      doc.setFont("helvetica", "bold");
      doc.text("Payment Mode:", 115, 87);
      doc.setFont("helvetica", "normal");
      doc.text(booking.paymentMethod || "Direct Settlement", 142, 87);
      
      doc.setFont("helvetica", "bold");
      doc.text("Reservation Status:", 115, 93);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(16, 185, 129);
      doc.text("Secure Hold Active", 150, 93);
      doc.setTextColor(30, 41, 59);
      
      doc.line(15, 100, 195, 100);
      
      // Summary Summary Table Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 58, 138);
      doc.text("ACCOMMODATION & FEES LEDGER", 15, 109);
      
      // Table content headers
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 114, 180, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("RESERVED ACCOMMODATION / SERVICE DESCRIPTION", 18, 119);
      doc.text("ALLOCATED TOTAL", 160, 119);
      
      // Item 1: Commission Secured
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Official MSU Rental Securing Fee (${booking.headsCount} Student slot)`, 18, 129);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Standard securing & validation commission registered with MSU portal", 18, 133);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`$${booking.headsCount * 20}.00 USD`, 160, 129);
      
      // Item 2: Upfront Deposit Choice
      const depositAmt = booking.customDepositAmount || 0;
      doc.text("Landlord Accommodation Deposit Placement", 18, 143);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Upfront deposit allotment choice: ${booking.depositChoice || "None"}`, 18, 147);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`$${depositAmt}.00 USD`, 160, 143);
      
      // Carrier fees
      const carrierFee = booking.paymentMethod === "EcoCash" ? 1 : 0;
      if (carrierFee > 0) {
        doc.text("EcoCash Network Fee", 18, 157);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("TelOne Road mobile operator surcharge transaction fee", 18, 161);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`$1.00 USD`, 160, 157);
      }
      
      doc.line(15, 170, 195, 170);
      
      // Grand Total
      const grandTotal = (booking.headsCount * 20) + depositAmt + carrierFee;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text("TOTAL PAID IN FULL:", 115, 179);
      doc.text(`$${grandTotal}.00 USD`, 160, 179);
      
      // Rules and Terms Info Box at bottom of PDF
      doc.setFillColor(239, 246, 255);
      doc.rect(15, 188, 180, 24, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(30, 58, 138);
      doc.text("IMPORTANT LANDLORD DIRECTIONS:", 18, 193);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 58, 138);
      doc.text("1. This verified receipt authorizes the tenant student to enter and occupy target premises listed above.", 18, 197);
      doc.text(`2. Target move-in is expected on or after ${booking.targetMoveIn}. Landlord is required to retain this receipt.`, 18, 201);
      doc.text("3. High speed borehole, Wi-Fi, and solar backup access details are provided directly to student upon arrival.", 18, 205);
      
      // Signatures
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text("Authorized Signature stamp", 15, 225);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Panashe Dondo, DOPES Managing Representative", 15, 229);
      
      // A small signature stamp or seal line
      doc.line(15, 233, 90, 233);
      doc.setTextColor(30, 58, 138);
      doc.setFont("helvetica", "bold");
      doc.text("DOPES SECURED \u2713", 15, 238);
      
      // Footer page index
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Dopes Accommodation Agency \u2022 Zimbabwe Registrar of Agencies #D-7392", 15, 260);
      doc.text("Page 1 of 1", 175, 260);
      
      const base64Pdf = doc.output("datauristring").split(",")[1];
      
      // Construct beautiful Email body detailing payment status
      const receiptEmailHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase;">Payment Confirmed</h1>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #a7f3d0; font-weight: 500;">Your Official DOPES Secure PDF Receipt is Attached!</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-top: 0;">
              Dear <strong>${booking.studentName}</strong>,
            </p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              We have audited your payment for <strong>${booking.houseTitle}</strong>. Your payment is now marked as <strong>VERIFIED COMPLETE & PAID</strong> on our secure student accommodation registry!
            </p>
            <p style="font-size: 13px; color: #64748b; line-height: 1.6; font-style: italic; border-left: 3px solid #cbd5e1; padding-left: 10px; margin: 15px 0;">
              Please note that we are not affiliated with Midlands State University (MSU), but this platform helps you secure quality student accommodation close to campus safely and easily.
            </p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              We have generated an official digital <strong>PDF Payment Receipt & Lease Permission</strong> and attached it directly to this email. You may present this certificate to your respective landlord during check-in.
            </p>
            
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 25px 0;">
              <strong style="color: #166534; display: block; margin-bottom: 5px; text-transform: uppercase; font-size: 11px; font-weight: 800; tracking-wide: 0.5px;">Move-In Clearance Issued</strong>
              <p style="margin: 0; font-size: 12px; color: #166534; line-height: 1.5;">
                Target Move-In Date: <strong>${booking.targetMoveIn}</strong><br />
                Security deposit choice: <strong>${booking.depositChoice === "Full" ? "Settle in Full" : (booking.depositChoice === "None" ? "Pay Landlord on Move-in" : `Partial $${booking.customDepositAmount} Paid`)}</strong>
              </p>
            </div>
            
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              If you have any further questions or require a transport match, please touch base with us on WhatsApp anytime. Welcome to your new home!
            </p>
            
            <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; margin-top: 30px;">
              <p style="margin: 0; font-weight: 700; color: #334155;">Dopes Accommodation Agency</p>
              <p style="margin: 3px 0 0 0;">dopesaccommodationagency@gmail.com • +263 78 073 6072</p>
            </div>
          </div>
        </div>
      `;
      
      // Dispatch email payload through our real backend
      const payload = {
        to: booking.studentEmail,
        subject: `[CONFIRMED] DOPES PAYMENT RECEIPT [REC-${booking.id.toUpperCase()}]`,
        html: receiptEmailHtml,
        text: `Dear ${booking.studentName}. Your payment for ${booking.houseTitle} is confirmed! Please check the attached official PDF receipt.`,
        gmailUser: smtpUser,
        gmailAppPassword: smtpPass,
        attachments: [
          {
            filename: `DOPES_Receipt_${booking.studentName.replace(/\s+/g, "_")}.pdf`,
            content: base64Pdf,
            encoding: "base64"
          }
        ]
      };
      
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr: any) {
        console.error("Non-JSON API Response received:", responseText);
        throw new Error(`Server returned a non-JSON webpage (status: ${response.status}). Response sample: "${responseText.substring(0, 160)}..."`);
      }
      
      if (data.success) {
        if (data.simulated) {
          setEmailStatusModal({
            show: true,
            success: true,
            simulated: true,
            title: "PDF Compiled (Gmail Sandbox Mode)",
            message: `An official DOPES PDF receipt has been successfully compiled for ${booking.studentName}.`,
            booking,
            details: data.details || "The mailer is currently in simulation mode.",
            suggestion: "Configure your Gmail SMTP credentials below to toggle real-time email carrier delivery instantly!"
          });
        } else {
          setEmailStatusModal({
            show: true,
            success: true,
            simulated: false,
            title: "Email Dispatch Successful! 🎉",
            message: `The official digital receipt PDF has been securely generated and successfully dispatched to ${booking.studentEmail}!`,
            booking
          });
        }
      } else {
        setEmailStatusModal({
          show: true,
          success: false,
          simulated: false,
          title: "Email Dispatch Failed ❌",
          message: `We were unable to deliver the digital receipt for ${booking.studentName} due to an SMTP authentication error.`,
          booking,
          warning: data.warning,
          details: data.details,
          suggestion: data.suggestion
        });
      }
    } catch (err: any) {
      console.error("PDF Receipt dispatch failure:", err);
      setEmailStatusModal({
        show: true,
        success: false,
        simulated: false,
        title: "Compilation/Network Error ❌",
        message: "An unexpected error occurred while compiling the PDF receipt or contacting the server.",
        booking,
        details: err.message
      });
    } finally {
      setSendingPdfId(null);
    }
  };

  const generateAndWhatsAppDoc = async (booking: Booking, type: "invoice" | "receipt") => {
    try {
      const doc = new jsPDF();
      
      // Draw background decorations
      doc.setFillColor(30, 58, 138); // Deep blue (#1e3a8a)
      doc.rect(0, 0, 210, 35, "F");
      
      // Brand Header text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text("DOPES ACCOMMODATION AGENCY", 15, 18);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(226, 232, 240);
      doc.text("Secure Off-Campus Student Housing & Booking Platform", 15, 24);
      doc.text("Gweru, Zimbabwe | dopesaccommodationagency@gmail.com", 15, 29);
      
      // Document title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text(type === "receipt" ? "OFFICIAL RECEIPT & LEASE PERMISSION" : "OFFICIAL RESERVATION INVOICE", 15, 48);
      
      // Status Stamp Box
      if (type === "receipt") {
        doc.setDrawColor(16, 185, 129); // emerald Green stamp border
        doc.setFillColor(240, 253, 250); // emerald bg
        doc.rect(142, 40, 53, 22, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(16, 185, 129);
        doc.text("VERIFIED PAID", 153, 49);
        doc.setFontSize(8);
        doc.setTextColor(5, 150, 105);
        doc.text("Panashe Dondo Audited", 147, 54);
        doc.text("Online Portal Record \u2705", 147, 58);
      } else {
        doc.setDrawColor(245, 158, 11); // Amber
        doc.setFillColor(254, 243, 199); // Amber bg
        doc.rect(142, 40, 53, 22, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(217, 119, 6);
        doc.text("PENDING VERIFY", 148, 49);
        doc.setFontSize(8);
        doc.setTextColor(180, 83, 9);
        doc.text("Payment Audit Required", 144, 54);
        doc.text("Secure Hold Active \u23f1", 146, 58);
      }
      
      // Metadata Details block (Left column)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text("PAYER / STUDENT DETAILS", 15, 68);
      
      doc.setFont("helvetica", "bold");
      doc.text("Name:", 15, 75);
      doc.setFont("helvetica", "normal");
      doc.text(booking.studentName, 42, 75);
      
      doc.setFont("helvetica", "bold");
      doc.text("Phone:", 15, 81);
      doc.setFont("helvetica", "normal");
      doc.text(booking.studentPhone, 42, 81);
      
      doc.setFont("helvetica", "bold");
      doc.text("Email:", 15, 87);
      doc.setFont("helvetica", "normal");
      doc.text(booking.studentEmail || "Not Provided", 42, 87);
      
      doc.setFont("helvetica", "bold");
      doc.text("Gender Group:", 15, 93);
      doc.setFont("helvetica", "normal");
      doc.text(booking.gender, 42, 93);
      
      // Receipt Details block (Right column)
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("TRANSACTION METADATA", 115, 68);
      
      doc.setFont("helvetica", "bold");
      doc.text(type === "receipt" ? "Receipt ID:" : "Invoice ID:", 115, 75);
      doc.setFont("helvetica", "normal");
      doc.text(`${type === "receipt" ? "REC" : "INV"}-${booking.id.toUpperCase()}`, 142, 75);
      
      doc.setFont("helvetica", "bold");
      doc.text("Date Issued:", 115, 81);
      doc.setFont("helvetica", "normal");
      doc.text(new Date().toLocaleDateString(), 142, 81);
      
      doc.setFont("helvetica", "bold");
      doc.text("Payment Mode:", 115, 87);
      doc.setFont("helvetica", "normal");
      doc.text(booking.paymentMethod || "Direct Settlement", 142, 87);
      
      doc.setFont("helvetica", "bold");
      doc.text("Reservation Status:", 115, 93);
      doc.setFont("helvetica", "normal");
      if (type === "receipt") {
        doc.setTextColor(16, 185, 129);
        doc.text("Secure Hold Active", 150, 93);
      } else {
        doc.setTextColor(245, 158, 11);
        doc.text("Temporary Lock Hold", 150, 93);
      }
      doc.setTextColor(30, 41, 59);
      
      doc.line(15, 100, 195, 100);
      
      // Summary Summary Table Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 58, 138);
      doc.text("ACCOMMODATION & FEES LEDGER", 15, 109);
      
      // Table content headers
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 114, 180, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("RESERVED ACCOMMODATION / SERVICE DESCRIPTION", 18, 119);
      doc.text("ALLOCATED TOTAL", 160, 119);
      
      // Item 1: Commission Secured
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Official MSU Rental Securing Fee (${booking.headsCount} Student slot)`, 18, 129);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Standard securing & validation commission registered with MSU portal", 18, 133);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`$${booking.headsCount * 20}.00 USD`, 160, 129);
      
      // Item 2: Upfront Deposit Choice
      const depositAmt = booking.customDepositAmount || 0;
      doc.text("Landlord Accommodation Deposit Placement", 18, 143);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Upfront deposit allotment choice: ${booking.depositChoice || "None"}`, 18, 147);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`$${depositAmt}.00 USD`, 160, 143);
      
      // Carrier fees
      const carrierFee = booking.paymentMethod === "EcoCash" ? 1 : 0;
      if (carrierFee > 0) {
        doc.text("EcoCash Network Fee", 18, 157);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("TelOne Road mobile operator surcharge transaction fee", 18, 161);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`$1.00 USD`, 160, 157);
      }
      
      doc.line(15, 170, 195, 170);
      
      // Grand Total
      const grandTotal = (booking.headsCount * 20) + depositAmt + carrierFee;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text(type === "receipt" ? "TOTAL PAID IN FULL:" : "TOTAL INVOICE AMOUNT:", 115, 179);
      doc.text(`$${grandTotal}.00 USD`, 160, 179);
      
      // Rules and Terms Info Box at bottom of PDF
      doc.setFillColor(239, 246, 255);
      doc.rect(15, 188, 180, 24, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(30, 58, 138);
      doc.text("IMPORTANT LANDLORD DIRECTIONS:", 18, 193);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 58, 138);
      doc.text("1. This verified document authorizes the tenant student to enter and occupy target premises listed above.", 18, 197);
      doc.text(`2. Target move-in is expected on or after ${booking.targetMoveIn}. Landlord is required to retain this document.`, 18, 201);
      doc.text("3. High speed borehole, Wi-Fi, and solar backup access details are provided directly to student upon arrival.", 18, 205);
      
      // Signatures
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text("Authorized Signature stamp", 15, 225);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Panashe Dondo, DOPES Managing Representative", 15, 229);
      
      // A small signature stamp or seal line
      doc.line(15, 233, 90, 233);
      doc.setTextColor(30, 58, 138);
      doc.setFont("helvetica", "bold");
      doc.text(type === "receipt" ? "DOPES SECURED \u2713" : "DOPES HOLD ACTIVE \u23f1", 15, 238);
      
      // Footer page index
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("Dopes Accommodation Agency \u2022 Zimbabwe Registrar of Agencies #D-7392", 15, 260);
      doc.text("Page 1 of 1", 175, 260);
      
      // Save locally to browser
      const filename = `DOPES_${type === "receipt" ? "Receipt" : "Invoice"}_${booking.studentName.replace(/\s+/g, "_")}.pdf`;
      doc.save(filename);
      
      // Build clean WhatsApp redirect
      let rawPhone = booking.studentPhone.trim().replace(/\s+/g, "").replace(/[^0-9+]/g, "");
      let formattedPhone = rawPhone;
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "263" + formattedPhone.slice(1);
      } else if (formattedPhone.startsWith("+")) {
        formattedPhone = formattedPhone.slice(1);
      }
      
      const statusTitle = type === "receipt" ? "VERIFIED PAYMENT RECEIPT" : "RESERVATION INVOICE";
      const messageText = `*DOPES ACCOMMODATION AGENCY* 🏠\n` +
        `----------------------------------------\n` +
        `Hello *${booking.studentName}*,\n\n` +
        `We have compiled and downloaded your official *${statusTitle}* [Code: ${booking.id.toUpperCase()}] for your accommodation reservation at:\n` +
        `👉 *${booking.houseTitle}*\n\n` +
        `• *Details*:\n` +
        `  - Securing Fee: $${booking.headsCount * 20} USD (${booking.headsCount} slot)\n` +
        `  - Landlord Deposit: $${depositAmt} Choice\n` +
        `  - Total Payment: *$${grandTotal} USD*\n` +
        `  - Target Move-In: ${booking.targetMoveIn}\n\n` +
        `*The formal DOPES PDF Document has been compiled and downloaded to this device.* Please attach the downloaded file \`${filename}\` in this chat!\n\n` +
        `Welcome to your student housing! Let us know if you require any logistics coordinate.`;
        
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(messageText)}`;
      window.open(whatsappUrl, "_blank");
      
    } catch (err: any) {
      console.error("WhatsApp doc compilation failure:", err);
      alert("Error compiling WhatsApp PDF: " + err.message);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const resetForm = () => {
    setEditingHouseId(null);
    setTitle("");
    setDescription("");
    setPrice(90);
    setLocation("Nehosho");
    setRoomType("Double Shared");
    setGenderLimit("Mixed");
    setMainCampusDist(0.8);
    setBatanaiDist(1.2);
    setTelOneDist(5.0);
    setSelectedFeatures(["Wi-Fi", "Borehole Water"]);
    setImageUrls([""]);
    setAvailableSlots(6);
    setMaxSlots(12);
    setShowAddForm(false);
  };

  const handleStartEdit = (house: House) => {
    setEditingHouseId(house.id);
    setTitle(house.title);
    setDescription(house.description);
    setPrice(house.price);
    setLocation(house.location);
    setRoomType(house.roomType);
    setGenderLimit(house.genderLimit);
    setMainCampusDist(house.distances.mainCampus);
    setBatanaiDist(house.distances.batanai);
    setTelOneDist(house.distances.telOne);
    setSelectedFeatures(house.features);
    setImageUrls(house.images && house.images.length > 0 ? [...house.images] : [""]);
    setAvailableSlots(house.availableSlots);
    setMaxSlots(house.maxSlots);
    setShowAddForm(true); // Re-use add form panel
  };

  const handleSaveHouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) return;

    let cleanUrls = imageUrls.map(url => url.trim()).filter(url => url !== "");
    if (cleanUrls.length === 0) {
      cleanUrls = [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
      ];
    }

    const houseData: House = {
      id: editingHouseId || "h-" + Date.now(),
      title,
      description,
      price: Number(price),
      location,
      roomType,
      genderLimit,
      distances: {
        mainCampus: Number(mainCampusDist),
        batanai: Number(batanaiDist),
        telOne: Number(telOneDist)
      },
      features: selectedFeatures,
      images: cleanUrls,
      availableSlots: Number(availableSlots),
      maxSlots: Number(maxSlots),
      isAvailable: Number(availableSlots) > 0
    };

    if (editingHouseId) {
      onEditHouse(houseData);
    } else {
      onAddHouse(houseData);
    }
    resetForm();
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-100 p-6 shadow-2xl relative">
          <button 
            type="button" 
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 rounded-full p-1"
          >
            <X size={18} />
          </button>
          
          <div className="text-center space-y-2 mb-6 pt-2">
            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Lock size={22} />
            </div>
            <h3 className="font-sans font-extrabold text-xl text-neutral-900 tracking-tight">Admin Gateway</h3>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter designated password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm bg-neutral-50 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            {authError && (
              <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg p-2.5">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-xl py-3 px-4 font-bold text-sm tracking-wide shadow-md shadow-blue-500/10 hover:bg-blue-700 active:scale-[0.99] transition-all cursor-pointer"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 max-h-screen overflow-hidden bg-neutral-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-blue-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/10 p-2 rounded-xl border border-white/10 shrink-0">
              <ClipboardList size={20} className="text-blue-300" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight">DOPES MSU Student Accomodation</h1>
              <p className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">Management Console</p>
            </div>
          </div>
          
          {/* Close trigger for mobile */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              onClick={() => setShowSmtpSettings(true)}
              className="bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white rounded-lg p-2 text-xs font-semibold transition-all"
              title="Gmail SMTP Setup"
            >
              <Settings size={15} />
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-white/10 hover:bg-white/15 text-neutral-200 hover:text-white rounded-lg p-2 text-xs font-semibold transition-all"
              title="Log out"
            >
              <LogOut size={15} />
            </button>
            <button
              onClick={onClose}
              className="bg-white text-blue-900 font-bold rounded-lg px-3 py-1.5 text-xs transition-all hover:bg-blue-50"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
          <div className="flex bg-blue-950/40 p-1 rounded-xl border border-blue-800/60 font-medium text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("listings")}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "listings" ? "bg-white text-blue-950 font-bold shadow-xs" : "hover:text-blue-100 text-blue-200/80"
              }`}
            >
              <Home size={13} /> Houses ({houses.length})
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "bookings" ? "bg-white text-blue-950 font-bold shadow-xs" : "hover:text-blue-100 text-blue-200/80"
              }`}
            >
              <ClipboardList size={13} /> Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "analytics" ? "bg-white text-blue-950 font-bold shadow-xs" : "hover:text-blue-100 text-blue-200/80"
              }`}
            >
              <BarChart3 size={13} className={activeTab === "analytics" ? "text-blue-600" : ""} /> Analytics
            </button>
            <button
              onClick={() => setActiveTab("deposits")}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "deposits" ? "bg-white text-blue-950 font-bold shadow-xs" : "hover:text-blue-100 text-blue-200/80"
              }`}
            >
              <Coins size={13} className={activeTab === "deposits" ? "text-amber-500" : ""} /> Deposits Ledger
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 font-semibold text-xs">
            <button
              onClick={() => setShowSmtpSettings(true)}
              className="bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white rounded-xl px-2.5 py-2 text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-blue-800/60"
              title="Configure Custom Gmail App Password"
            >
              <Settings size={15} />
              <span>Gmail Manual Setup</span>
            </button>
            
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-transparent hover:bg-white/10 text-neutral-300 hover:text-white rounded-xl p-2 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              title="Log out"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
            
            <button
              onClick={onClose}
              className="bg-white text-blue-900 font-bold rounded-xl px-4 py-2 text-xs transition-all hover:bg-blue-50 cursor-pointer"
            >
              Close Panel
            </button>
          </div>
        </div>
      </header>

      {/* Main split dashboard context */}
      <div className="flex-1 overflow-auto p-6 max-w-7xl w-full mx-auto font-medium">
        {activeTab === "listings" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side: List of houses */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-neutral-800">Current House Properties</h2>
                  <p className="text-xs text-neutral-500">Edit features, slot reservations, or prices of published houses.</p>
                </div>
                {!showAddForm && (
                  <button
                    onClick={() => { resetForm(); setShowAddForm(true); }}
                    className="bg-blue-600 text-white text-xs font-bold rounded-xl py-2.5 px-4 shadow-sm hover:bg-blue-700 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Add New House
                  </button>
                )}
              </div>

              {houses.length === 0 ? (
                <div className="bg-white border rounded-2xl p-8 text-center text-neutral-500 text-sm">
                  No houses listed yet. Click "Add New House" to publish your first student home.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {houses.map((house) => (
                    <div 
                      key={house.id} 
                      className="bg-white hover:border-blue-200 border border-neutral-100 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-start"
                    >
                      <img 
                        src={house.images[0]} 
                        alt={house.title} 
                        referrerPolicy="no-referrer"
                        className="w-full md:w-32 h-24 object-cover rounded-xl bg-neutral-100" 
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold uppercase">
                            {house.roomType}
                          </span>
                          <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md font-semibold">
                            {house.location}
                          </span>
                        </div>
                        <h4 className="font-bold text-neutral-800 text-sm">{house.title}</h4>
                        <p className="text-xs text-neutral-400 line-clamp-1">{house.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-[11px] font-bold text-neutral-500 pt-1.5 pt-1.5">
                          <span className="text-blue-600 font-extrabold flex items-center gap-0.5">
                            <DollarSign size={12} />{house.price}/month
                          </span>
                          <span className="flex items-center gap-1">
                            <School size={11} className="text-neutral-400" /> Main: {house.distances.mainCampus}km
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-neutral-400" /> Batanai: {house.distances.batanai}km
                          </span>
                          <span className="flex items-center gap-1">
                            <School size={11} className="text-neutral-400" /> TelOne: {house.distances.telOne}km
                          </span>
                          <span className="font-black text-rose-600">
                            Slots: {house.availableSlots} / {house.maxSlots} free
                          </span>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-2 w-full md:w-auto self-stretch justify-end">
                        <button
                          onClick={() => handleStartEdit(house)}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-250 rounded-xl p-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${house.title}?`)) {
                              onDeleteHouse(house.id);
                            }
                          }}
                          className="flex-1 bg-red-50 hover:bg-red-105 text-red-650 border border-red-100 rounded-xl p-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Add / Edit House Form Panel */}
            <div className="lg:col-span-1">
              {showAddForm ? (
                <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-2">
                      <Sparkles className="text-blue-500" size={16} />
                      {editingHouseId ? "Edit House Listing" : "List New House"}
                    </h3>
                    <button
                      onClick={resetForm}
                      className="text-neutral-400 hover:text-neutral-600 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveHouse} className="space-y-3 text-xs">
                    {/* Title */}
                    <div>
                      <label className="block text-neutral-600 font-bold mb-1">House/Hostel Title</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Windsor Gate Luxury Double"
                        className="w-full rounded-lg border border-neutral-200 p-2 text-xs bg-neutral-50/50 outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Suburb Description */}
                    <div>
                      <label className="block text-neutral-600 font-bold mb-1">Detailed Description</label>
                      <textarea
                        required
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="State features, study environment, backup facilities..."
                        className="w-full rounded-lg border border-neutral-200 p-2 text-xs bg-neutral-50/50 outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* Price and Suburb Location */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Price per Head ($)</label>
                        <input
                          type="number"
                          required
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          className="w-full rounded-lg border border-neutral-200 p-2 text-xs bg-neutral-50/50 outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Location Suburb</label>
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Nehosho, Gweru"
                          className="w-full rounded-lg border border-neutral-200 p-2 text-xs bg-neutral-50/50 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Types and Gender limitation */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Room Class</label>
                        <select
                          value={roomType}
                          onChange={(e) => setRoomType(e.target.value as House["roomType"])}
                          className="w-full rounded-lg border border-neutral-200 p-2 text-xs bg-white outline-none focus:border-blue-500"
                        >
                          {PRESET_ROOM_TYPES.map(rt => (
                            <option key={rt} value={rt}>{rt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Gender Limit</label>
                        <select
                          value={genderLimit}
                          onChange={(e) => setGenderLimit(e.target.value as House["genderLimit"])}
                          className="w-full rounded-lg border border-neutral-200 p-2 text-xs bg-white outline-none focus:border-blue-500"
                        >
                          <option value="Mixed">Mixed Allowed</option>
                          <option value="Female Only">Female Only</option>
                          <option value="Male Only">Male Only</option>
                        </select>
                      </div>
                    </div>

                    {/* Campus Distances */}
                    <div className="p-2.5 bg-neutral-50 rounded-lg space-y-2 border border-neutral-100">
                      <span className="font-extrabold text-neutral-700 block uppercase text-[10px] tracking-wider mb-1">
                        Campus Distances (Kilometers)
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        <div>
                          <label className="block text-neutral-500 mb-0.5">MSU Main</label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            value={mainCampusDist}
                            onChange={(e) => setMainCampusDist(Number(e.target.value))}
                            className="w-full rounded-md border border-neutral-200 p-1.5 bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-500 mb-0.5">Batanai</label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            value={batanaiDist}
                            onChange={(e) => setBatanaiDist(Number(e.target.value))}
                            className="w-full rounded-md border border-neutral-200 p-1.5 bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-500 mb-0.5">TelOne</label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            value={telOneDist}
                            onChange={(e) => setTelOneDist(Number(e.target.value))}
                            className="w-full rounded-md border border-neutral-200 p-1.5 bg-white outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Slots available & max slots */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Available Slots</label>
                        <input
                          type="number"
                          required
                          value={availableSlots}
                          onChange={(e) => setAvailableSlots(Number(e.target.value))}
                          className="w-full rounded-lg border border-neutral-200 p-2 text-xs bg-neutral-50/50 outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Maximum Slots</label>
                        <input
                          type="number"
                          required
                          value={maxSlots}
                          onChange={(e) => setMaxSlots(Number(e.target.value))}
                          className="w-full rounded-lg border border-neutral-200 p-2 text-xs bg-neutral-50/50 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div>
                      <label className="block text-neutral-600 font-bold mb-1">Amenities</label>
                      <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto p-1.5 border rounded-lg bg-white">
                        {PRESET_FEATURES.map((feat) => (
                          <label key={feat} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedFeatures.includes(feat)}
                              onChange={() => handleFeatureToggle(feat)}
                              className="accent-blue-600"
                            />
                            <span className="text-[10px] text-neutral-600">{feat}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Image URLs (Up to 10 Pictures) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-neutral-600 font-bold">
                          Pictures / Photos (Up to 10)
                        </label>
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md font-bold">
                          {imageUrls.filter(u => u.trim() !== "").length} / 10 Added
                        </span>
                      </div>

                      {/* Display preset Quick-Add suggestions */}
                      <div className="text-[10px] text-neutral-400 font-medium pb-1.5 border-b border-neutral-100">
                        Quick Preset Photos:
                        <div className="flex flex-wrap gap-1 mt-1">
                          {[
                            { label: "🛏️ Bedroom", url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80" },
                            { label: "🍳 Kitchen", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80" },
                            { label: "🌻 Garden", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
                            { label: "📚 Study Desk", url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80" },
                            { label: "🚿 Bath", url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80" }
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                // Add to imageUrls state at the first empty index or append if < 10
                                const firstEmptyIdx = imageUrls.findIndex(url => url.trim() === "");
                                if (firstEmptyIdx !== -1) {
                                  const updated = [...imageUrls];
                                  updated[firstEmptyIdx] = preset.url;
                                  setImageUrls(updated);
                                } else if (imageUrls.length < 10) {
                                  setImageUrls([...imageUrls, preset.url]);
                                }
                              }}
                              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded text-[9px] font-semibold transition-colors cursor-pointer"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {imageUrls.map((url, idx) => (
                          <div key={idx} className="flex gap-1.5 items-center">
                            {/* Small preview thumbnail */}
                            <div className="w-8 h-8 rounded bg-neutral-100 border overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {url.trim() ? (
                                <img
                                  src={url}
                                  alt="preview"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=150&q=50";
                                  }}
                                />
                              ) : (
                                <span className="text-[10px] text-neutral-400 font-bold">{idx + 1}</span>
                              )}
                            </div>

                            <input
                              type="url"
                              placeholder={`Image URL ${idx + 1}`}
                              value={url}
                              onChange={(e) => {
                                const updated = [...imageUrls];
                                updated[idx] = e.target.value;
                                setImageUrls(updated);
                              }}
                              className="flex-1 rounded-lg border border-neutral-200 p-2 text-xs bg-neutral-50/50 outline-none focus:border-blue-500"
                            />

                            {/* Delete input button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (imageUrls.length > 1) {
                                  setImageUrls(imageUrls.filter((_, i) => i !== idx));
                                } else {
                                  const updated = [...imageUrls];
                                  updated[0] = "";
                                  setImageUrls(updated);
                                }
                              }}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 transition-colors cursor-pointer"
                              title="Delete URL"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {imageUrls.length < 10 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (imageUrls.length < 10) {
                              setImageUrls([...imageUrls, ""]);
                            }
                          }}
                          className="w-full border-dashed border-2 border-neutral-200 py-1.5 rounded-lg text-neutral-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/20 text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer mt-1"
                        >
                          <Plus size={11} /> Add Another Picture Field ({imageUrls.length}/10)
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white rounded-xl py-2.5 font-bold hover:bg-blue-700 transition-all cursor-pointer"
                    >
                      {editingHouseId ? "Save Modifications" : "Publish Listing"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 mx-auto shadow-xs">
                    <Home size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-800 text-xs">Publish on DOPES MSU</h3>
                    <p className="text-[11px] text-neutral-500 leading-normal">
                      Provide details about student accommodation capacities, distance markers, photos, and monthly rents.
                    </p>
                  </div>
                  <button
                    onClick={() => { resetForm(); setShowAddForm(true); }}
                    className="bg-blue-600 text-white rounded-xl py-2 px-4 shadow-sm text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer w-full"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 border border-neutral-150 p-4 rounded-2xl animate-fade-in">
              <div>
                <h2 className="text-lg font-black text-neutral-800">Booking Submission Logs</h2>
                <p className="text-xs text-neutral-500">
                  Below are the bookings completed by students. They have received the WhatsApp redirect link to reach your phone.
                </p>
              </div>
              {bookings.length > 0 && onDeleteAllBookings && (
                <button
                  type="button"
                  onClick={() => {
                    const confirmFirst = window.confirm("⚠️ DANGER ZONE: Are you sure you want to delete ALL booking logs?\n\nThis will clear all booking history, reset client logs, and wipe database records permanently. This action cannot be undone!");
                    if (confirmFirst) {
                      const confirmSecond = window.confirm("FINAL CONFIRMATION REQUEST:\n\nClick OK if you are positive you want to completely erase and delete all bookings.");
                      if (confirmSecond) {
                        onDeleteAllBookings();
                      }
                    }
                  }}
                  className="bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-700 font-extrabold text-[11px] px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer shadow-xs"
                >
                  <Trash2 size={13} className="text-red-650" />
                  <span>Clear All Bookings</span>
                </button>
              )}
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white border rounded-2xl p-10 text-center text-neutral-400 text-sm">
                No students have booked through the form yet. When bookings are initiated, their logs will persist here.
              </div>
            ) : (
              <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-500">
                    <thead className="bg-neutral-50 text-neutral-700 font-extrabold uppercase tracking-wider border-b text-[10px]">
                      <tr>
                        <th className="p-4 text-center w-4">Settled</th>
                        <th className="p-4">Student Info</th>
                        <th className="p-4">Target House</th>
                        <th className="p-4">Target Date</th>
                        <th className="p-4">Heads Code</th>
                        <th className="p-4">Agent Fee Status</th>
                        <th className="p-4 text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {bookings.map((booking) => {
                        const fee = booking.headsCount * 20;
                        const isCompleted = !!booking.completed;
                        return (
                          <tr 
                            key={booking.id} 
                            className={`hover:bg-neutral-50/50 transition-colors ${
                              isCompleted 
                                ? "bg-emerald-50/15 border-l-[3.5px] border-l-emerald-500" 
                                : ""
                            }`}
                          >
                            {/* Settled Tickbox */}
                            <td className="p-4 text-center">
                              <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={async () => {
                                  onToggleBookingCompleted?.(booking.id);
                                  if (!isCompleted) {
                                    setToast({
                                      show: true,
                                      message: `Deposit verified complete for ${booking.studentName}!`
                                    });
                                  }
                                }}
                                className="h-4 w-4 rounded-md text-blue-600 focus:ring-blue-500 border-neutral-300 transition-all cursor-pointer accent-blue-600"
                                title={isCompleted ? "Mark as Pending" : "Mark as Completed / Paid"}
                              />
                            </td>
                            {/* Student Info */}
                            <td className="p-4">
                              <div className="font-bold text-neutral-800 text-sm flex items-center gap-2">
                                {booking.studentName}
                                {isCompleted && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full select-none">
                                    PAID
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-neutral-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                                <span className="bg-neutral-100 px-1.5 py-0.5 rounded-md font-medium text-[10px]">{booking.gender}</span>
                                <span>{booking.studentPhone}</span>
                                {booking.studentEmail && (
                                  <span className="text-neutral-500 font-medium">✉️ {booking.studentEmail}</span>
                                )}
                                {booking.paymentMethod === "EcoCash" && (
                                  <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                    EcoCash: {booking.ecoCashNumber || "Self Direct"}
                                  </span>
                                )}
                                {booking.depositChoice && (
                                  <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                    Deposit Offer: {booking.depositChoice === "Full" ? "Full" : booking.depositChoice === "None" ? "No Upfront" : `$${booking.customDepositAmount} USD`}
                                  </span>
                                )}
                              </div>
                              {booking.proofOfPaymentBase64 && (
                                <button
                                  onClick={() => {
                                    setProofPreview(booking.proofOfPaymentBase64!);
                                    setPreviewBookingName(booking.studentName);
                                  }}
                                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200 mt-1.5 inline-flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Eye size={12} /> View Proof Screenshot
                                </button>
                              )}
                            </td>
                            {/* Target House */}
                            <td className="p-4">
                              <span className="font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-md text-[11px]">
                                {booking.houseTitle}
                              </span>
                            </td>
                            {/* Move-in Date */}
                            <td className="p-4 font-semibold text-neutral-700">
                              {booking.targetMoveIn}
                            </td>
                            {/* Heads Count */}
                            <td className="p-4">
                              <div className="font-bold text-neutral-700 flex items-center gap-1 w-fit bg-neutral-100 px-2.5 py-1 rounded-full">
                                <Users size={12} className="text-neutral-500" />
                                {booking.headsCount} Space{booking.headsCount > 1 ? "s" : ""}
                              </div>
                            </td>
                            {/* Agent booking fee */}
                            <td className="p-4">
                              {isCompleted ? (
                                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                                  <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                  ${fee} USD Settled
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg">
                                  <Clock size={12} className="text-amber-500 shrink-0 animate-pulse" />
                                  ${fee} USD Pending
                                </div>
                              )}
                            </td>
                            {/* Operations */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => generateAndWhatsAppDoc(booking, isCompleted ? "receipt" : "invoice")}
                                  className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all cursor-pointer shadow-xs"
                                  title="Download PDF & Send Receipt via WhatsApp to Student"
                                >
                                  <MessageSquare size={11} className="text-emerald-600 animate-pulse" />
                                  <span>WhatsApp {isCompleted ? "Receipt" : "Invoice"}</span>
                                </button>

                                {booking.studentEmail && (
                                  <button
                                    onClick={() => generateAndSendPDFReceipt(booking)}
                                    disabled={sendingPdfId === booking.id}
                                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                      isCompleted
                                        ? "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                                        : "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                                    }`}
                                    title="Send formal PDF Invoice/Receipt"
                                  >
                                    {sendingPdfId === booking.id ? (
                                      <Loader2 size={11} className="animate-spin text-blue-600" />
                                    ) : (
                                      <Mail size={11} className={isCompleted ? "text-slate-500" : "text-blue-600"} />
                                    )}
                                    <span>{isCompleted ? "Email Receipt" : "Email Invoice"}</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    if (confirm("Delete this booking log? This will not cancel their booking but deletes this record from local logs.")) {
                                      onDeleteBooking(booking.id);
                                    }
                                  }}
                                  className="bg-red-50 hover:bg-red-100/70 text-red-650 rounded-lg p-2 transition-all cursor-pointer inline-flex items-center"
                                  title="Delete Log Record"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Financials & Client Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-100 border border-neutral-200/60 p-4 rounded-2xl">
              <div>
                <h2 className="text-lg font-black text-neutral-800">Financial Growth & Platform Performance</h2>
                <p className="text-xs text-neutral-500">
                  Review total accrued fees, occupancy rates, and register offline placement transactions.
                </p>
              </div>
              {bookings.length > 0 && onDeleteAllBookings && (
                <button
                  type="button"
                  onClick={() => {
                    const confirmFirst = window.confirm("⚠️ RESET WARNING: Do you want to completely RESET all booking analytics and occupancy stats?\n\nThis deletes all booking data logs globally. It is an irreversible operation.");
                    if (confirmFirst) {
                      const confirmSecond = window.confirm("FINAL CONFIRMATION REQUEST:\n\nThis will reset all analytical dashboards, secured commission fees, and occupancy statistics to zero. Click OK to proceed.");
                      if (confirmSecond) {
                        onDeleteAllBookings();
                      }
                    }
                  }}
                  className="bg-red-50 hover:bg-red-100/80 border border-red-200 text-red-700 font-extrabold text-[11px] px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 self-start sm:self-center shrink-0 cursor-pointer shadow-xs"
                >
                  <Trash2 size={13} className="text-red-650" />
                  <span>Reset All Analytics Stats No Logs</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* KPI 1: Collected Booking Fees */}
              <div className="bg-white border hover:border-blue-100 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-all">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest">Commission Fees Secured</span>
                  <h3 className="text-2xl font-black text-slate-900">
                    ${bookings.reduce((sum, b) => sum + (b.headsCount * 20), 0)} USD
                  </h3>
                  <div className="text-[10px] text-neutral-500 font-semibold space-y-0.5 mt-1 leading-none">
                    <p className="text-emerald-755 font-bold">● ${bookings.filter(b => b.completed).reduce((sum, b) => sum + (b.headsCount * 20), 0)} Settled/Paid</p>
                    <p className="text-amber-755 font-bold">● ${bookings.filter(b => !b.completed).reduce((sum, b) => sum + (b.headsCount * 20), 0)} Outstanding</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <Coins size={22} />
                </div>
              </div>

              {/* KPI 2: Total Placements (Heads) */}
              <div className="bg-white border hover:border-blue-100 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-all">
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest">Total Students Placed</span>
                  <h3 className="text-2xl font-black text-slate-900">
                    {bookings.reduce((sum, b) => sum + b.headsCount, 0)} Students
                  </h3>
                  <p className="text-[10px] text-blue-600 font-semibold truncate leading-none mt-1">
                    {bookings.filter(b => b.id.includes("b-manual")).length} Offline manual matches
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                  <Users size={22} />
                </div>
              </div>

              {/* KPI 3: Global Occupancy Rate */}
              <div className="bg-white border hover:border-blue-100 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-all">
                <div className="space-y-1.5 w-full">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest">Avg Space Occupancy</span>
                    <span className="text-xs font-black text-blue-600">
                      {Math.round(
                        (houses.reduce((acc, h) => acc + (h.maxSlots - h.availableSlots), 0) / 
                         Math.max(1, houses.reduce((acc, h) => acc + h.maxSlots, 0))) * 100
                      )}%
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div 
                      style={{
                        width: `${Math.min(100, Math.round(
                          (houses.reduce((acc, h) => acc + (h.maxSlots - h.availableSlots), 0) / 
                           Math.max(1, houses.reduce((acc, h) => acc + h.maxSlots, 0))) * 100
                        ))}%`
                      }} 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                  <p className="text-[9px] text-neutral-400 font-semibold">
                    {houses.reduce((acc, h) => acc + (h.maxSlots - h.availableSlots), 0)} of {houses.reduce((acc, h) => acc + h.maxSlots, 0)} slots taken
                  </p>
                </div>
              </div>
            </div>

            {/* Suburb Demand Map & Manual Placement Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Segment: Suburb Demands & Smart Insights (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
                    <BarChart3 size={16} className="text-blue-600" /> Suburb Booking Densities & Occupancies
                  </h3>

                  <div className="space-y-4 pt-1">
                    {Array.from(new Set(houses.map(h => h.location.split(",")[0].trim()))).map((loc) => {
                      const matchedHouses = houses.filter(h => h.location.toLowerCase().includes(loc.toLowerCase()));
                      const totalMax = matchedHouses.reduce((sum, h) => sum + h.maxSlots, 0);
                      const totalFree = matchedHouses.reduce((sum, h) => sum + h.availableSlots, 0);
                      const totalOccupied = totalMax - totalFree;
                      const fillPct = totalMax > 0 ? Math.round((totalOccupied / totalMax) * 100) : 0;
                      const bookedHere = bookings.filter(b => b.houseTitle.toLowerCase().includes(loc.toLowerCase()) || b.notes?.toLowerCase().includes(loc.toLowerCase())).length;

                      return (
                        <div key={loc} className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center text-neutral-700 font-semibold text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-800">{loc} suburb</span>
                              <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                {bookedHere} Match{bookedHere !== 1 ? "es" : ""}
                              </span>
                            </div>
                            <span className="font-bold text-neutral-500">{totalOccupied}/{totalMax} rooms filled ({fillPct}%)</span>
                          </div>
                          <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden flex">
                            <div 
                              style={{ width: `${Math.min(100, fillPct)}%` }}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-350"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Smart Insights Block */}
                <div className="bg-yellow-50 bg-opacity-40 border border-yellow-105 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-neutral-800 text-xs flex items-center gap-1.5">
                    <Lightbulb size={16} className="text-yellow-600 shrink-0" />
                    Dopes-Accomm Growth Insights
                  </h4>
                  <ul className="text-xs text-neutral-600 pl-5 list-disc space-y-2 font-medium leading-relaxed">
                    <li>
                      <span className="font-bold text-neutral-905">Highest Yield Suburbs:</span> Adelaide Park and CBZ generate premium yields averaging $100-$130 per room due to fiber Wi-Fi support and high-performance solar borehole settings.
                    </li>
                    <li>
                      <span className="font-bold text-neutral-905">Boreholes & Back-up:</span> Over 90% of students filter options to select solar & borehole backed spaces first. Keep vetting houses matching these standards to boost conversion.
                    </li>
                    <li>
                      <span className="font-bold text-neutral-905">Dense Placement Focus:</span> MSU Main Campus proximity remains the highest volume target representing Nehosho and Senga suburbs. Target matching efforts primarily towards these regions to fulfill high volumes fast.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Segment: Record Offline Placement Form (5 cols) */}
              <div className="lg:col-span-5">
                <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="border-b pb-3 block">
                    <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
                      <PlusCircle className="text-blue-600 animate-pulse" size={16} /> Record Manual/Offline Matching
                    </h3>
                    <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                      Helped a client directly off-site or via WhatsApp? Record the placement here to securely include their statistics in your revenue logs and reduce the house's vacancy.
                    </p>
                  </div>

                  {manualSuccess && (
                     <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-xl text-xs font-bold leading-normal">
                      ✓ Offline placement successfully registered! Your stats, revenue growth card, and available housing slots have been updated immediately.
                     </div>
                  )}

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!manualStudentName) return;

                      const selectedHouse = houses.find(h => h.id === manualHouseId);
                      const titleToSet = manualHouseId === "other" 
                        ? customHouseTitle 
                        : (selectedHouse ? selectedHouse.title : "Direct Offline Placement");

                      if (onAddBooking) {
                        onAddBooking({
                          id: "b-manual-" + Date.now(),
                          houseId: manualHouseId === "other" ? "manual-other" : manualHouseId,
                          houseTitle: titleToSet,
                          studentName: manualStudentName,
                          studentPhone: manualStudentPhone || "Direct Manual Contact",
                          gender: manualStudentGender,
                          headsCount: Number(manualHeadsCount),
                          targetMoveIn: manualMoveInDate || new Date().toISOString().substring(0, 10),
                          notes: `Offline Placement - Handled manually by Admin${manualNotes ? " (" + manualNotes + ")" : ""}`,
                          timestamp: new Date().toISOString()
                        });

                        setManualSuccess(true);
                        setManualStudentName("");
                        setManualStudentPhone("");
                        setManualNotes("");
                        setTimeout(() => setManualSuccess(false), 4000);
                      }
                    }} 
                    className="space-y-3.5 text-xs"
                  >
                    <div>
                      <label className="block text-neutral-600 font-bold mb-1">Student Full Name</label>
                      <input
                        type="text"
                        required
                        value={manualStudentName}
                        onChange={(e) => setManualStudentName(e.target.value)}
                        placeholder="e.g. Tendai Moyo"
                        className="w-full rounded-lg border border-neutral-205 p-2 text-xs bg-neutral-50/50 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Student Phone</label>
                        <input
                          type="text"
                          value={manualStudentPhone}
                          onChange={(e) => setManualStudentPhone(e.target.value)}
                          placeholder="e.g. +263 7..."
                          className="w-full rounded-lg border border-neutral-205 p-2 text-xs bg-neutral-50/50 outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Gender Class</label>
                        <select
                          value={manualStudentGender}
                          onChange={(e) => setManualStudentGender(e.target.value as "Male" | "Female")}
                          className="w-full rounded-lg border border-neutral-205 p-2 text-xs bg-white outline-none focus:border-blue-500 animate-none"
                        >
                          <option value="Female">Female Student</option>
                          <option value="Male">Male Student</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-600 font-bold mb-1">Housing spot assigned</label>
                      <select
                        value={manualHouseId}
                        onChange={(e) => setManualHouseId(e.target.value)}
                        className="w-full rounded-lg border border-neutral-205 p-2 text-xs bg-white outline-none focus:border-blue-500 animate-none"
                      >
                        {houses.map(h => (
                          <option key={h.id} value={h.id}>
                            {h.title} (${h.price}/mo, {h.availableSlots} free slots)
                          </option>
                        ))}
                        <option value="other">Unlisted / Custom Private Cottage</option>
                      </select>
                    </div>

                    {manualHouseId === "other" && (
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Custom Cottage Name / Suburb</label>
                        <input
                          type="text"
                          required
                          value={customHouseTitle}
                          onChange={(e) => setCustomHouseTitle(e.target.value)}
                          className="w-full rounded-lg border border-neutral-205 p-2 text-xs bg-neutral-50/50 outline-none focus:border-blue-500"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Student Places Filled</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="10"
                          value={manualHeadsCount}
                          onChange={(e) => setManualHeadsCount(Number(e.target.value))}
                          className="w-full rounded-lg border border-neutral-205 p-2 text-xs bg-neutral-50/50 outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-600 font-bold mb-1">Date Matched</label>
                        <input
                          type="date"
                          value={manualMoveInDate}
                          onChange={(e) => setManualMoveInDate(e.target.value)}
                          className="w-full rounded-lg border border-neutral-205 p-2 text-xs bg-neutral-50/50 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-600 font-bold mb-1">Admin Notes</label>
                      <textarea
                        value={manualNotes}
                        onChange={(e) => setManualNotes(e.target.value)}
                        rows={2}
                        placeholder="e.g. Collected the $20 agent booking fee directly"
                        className="w-full rounded-lg border border-neutral-205 p-2 text-xs bg-neutral-50/50 outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10"
                    >
                      <Check size={14} /> Record Offline Match
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deposits Ledger Tab */}
        {activeTab === "deposits" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Verified Deposits</span>
                  <div className="text-2xl font-black mt-1 text-emerald-400">
                    ${bookings
                      .filter(b => b.completed && b.depositChoice && b.depositChoice !== "None")
                      .reduce((sum, b) => sum + (b.customDepositAmount || 0), 0)} USD
                  </div>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl">
                  <Coins size={20} />
                </div>
              </div>

              <div className="bg-white border text-neutral-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Pending Safe Auditing</span>
                  <div className="text-2xl font-black mt-1 text-amber-655">
                    ${bookings
                      .filter(b => !b.completed && b.depositChoice && b.depositChoice !== "None")
                      .reduce((sum, b) => sum + (b.customDepositAmount || 0), 0)} USD
                  </div>
                </div>
                <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl">
                  <Clock size={20} />
                </div>
              </div>

              <div className="bg-white border text-neutral-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Total Deposits Volume</span>
                  <div className="text-2xl font-black mt-1 text-blue-600">
                    {bookings.filter(b => b.depositChoice && b.depositChoice !== "None").length} Payer Logs
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                  <ClipboardList size={20} />
                </div>
              </div>
            </div>

            {/* Deposits Ledger Search / Filter block */}
            <div className="bg-white border rounded-2xl p-5 space-y-4 shadow-xs animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4 border-neutral-100">
                <div>
                  <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
                    <Coins className="text-amber-500 animate-pulse" size={16} /> MSU Placement Deposit Ledger
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Direct ledger log tracking landlord deposit payment allocations and student student payer information.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {bookings.some(b => b.depositChoice && b.depositChoice !== "None") && onDeleteAllBookings && (
                    <button
                      type="button"
                      onClick={() => {
                        const confirmFirst = window.confirm("⚠️ DANGER ZONE: Clear all placement deposits from the ledger?\n\nThis will permanently delete all student booking logs that have registered deposit selections.");
                        if (confirmFirst) {
                          const confirmSecond = window.confirm("CONFIRMATION REQUEST:\n\nThis is irreversible. Type OK to proceed with erasing all deposit logs from the ledger database.");
                          if (confirmSecond) {
                            onDeleteAllBookings();
                          }
                        }
                      }}
                      className="bg-red-50 hover:bg-red-100/85 border border-red-150 text-red-700 font-extrabold text-[10.5px] px-3.5 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Trash2 size={12} />
                      <span>Clear Deposits Ledger</span>
                    </button>
                  )}
                  <div className="w-full md:w-64">
                    <input
                      type="text"
                      placeholder="Search by student name or email..."
                      value={depositsSearchQuery}
                      onChange={(e) => setDepositsSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200 p-2 text-xs bg-slate-50 focus:bg-white outline-none focus:border-blue-500 placeholder-neutral-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              {(() => {
                const filtered = bookings
                  .filter(b => b.depositChoice && b.depositChoice !== "None")
                  .filter(b => {
                    if (!depositsSearchQuery) return true;
                    const q = depositsSearchQuery.toLowerCase();
                    return (
                      b.studentName.toLowerCase().includes(q) ||
                      (b.studentEmail && b.studentEmail.toLowerCase().includes(q))
                    );
                  });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 border-2 border-dashed rounded-xl text-center text-neutral-400 text-xs font-semibold">
                      {depositsSearchQuery ? "No matching payment logs found for search query." : "No deposits registered."}
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto rounded-xl border border-neutral-100">
                    <table className="w-full text-left text-xs text-neutral-500">
                      <thead className="bg-neutral-50 text-neutral-700 font-extrabold uppercase tracking-wider border-b text-[10px]">
                        <tr>
                          <th className="p-4 text-center w-4">Tick Paid</th>
                          <th className="p-4">Student details</th>
                          <th className="p-4">Target Room House</th>
                          <th className="p-3">Deposit level (Upfront)</th>
                          <th className="p-4 text-right">Operations and digital PDF triggers</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-semibold">
                        {filtered.map((b) => {
                          const isCompleted = !!b.completed;
                          const depositAmtText = b.depositChoice === "Full" 
                            ? `Full Deposit (${b.customDepositAmount ? `$${b.customDepositAmount}` : "Room Price"} USD)` 
                            : `Custom Deposit Offer ($${b.customDepositAmount} USD)`;

                          return (
                            <tr 
                              key={b.id} 
                              className={`hover:bg-neutral-50/50 transition-colors ${
                                isCompleted ? "bg-emerald-50/15" : ""
                              }`}
                            >
                              {/* Toggle Completion */}
                              <td className="p-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  onChange={async () => {
                                    onToggleBookingCompleted?.(b.id);
                                    if (!isCompleted) {
                                      setToast({
                                        show: true,
                                        message: `Deposit verified complete for ${b.studentName}!`
                                      });
                                    }
                                  }}
                                  className="h-4 w-4 rounded-md text-blue-600 focus:ring-blue-500 border-neutral-300 transition-all cursor-pointer accent-blue-600"
                                  title={isCompleted ? "Mark Pending" : "Mark Paid & Confirmed"}
                                />
                              </td>

                              {/* Student detail */}
                              <td className="p-4">
                                <div className="font-bold text-neutral-800 text-sm flex items-center gap-1.5">
                                  {b.studentName}
                                  {isCompleted && (
                                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                                      VERIFIED
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-neutral-400 mt-0.5 space-y-0.5">
                                  {b.studentEmail && <div className="text-neutral-500">✉️ {b.studentEmail}</div>}
                                  <div>📞 {b.studentPhone}</div>
                                </div>
                              </td>

                              {/* House Title */}
                              <td className="p-4">
                                <span className="font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-md text-[10px]">
                                  {b.houseTitle}
                                </span>
                              </td>

                              {/* Offer Details */}
                              <td className="p-3">
                                <span className="font-black text-emerald-700 block text-xs">
                                  {depositAmtText}
                                </span>
                                {b.paymentMethod && (
                                  <span className="text-[9px] text-neutral-400 block mt-0.5 font-medium">Mode: {b.paymentMethod}</span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2.5">
                                  {b.proofOfPaymentBase64 && (
                                    <button
                                      onClick={() => {
                                        setProofPreview(b.proofOfPaymentBase64!);
                                        setPreviewBookingName(b.studentName);
                                      }}
                                      className="bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                      <Eye size={11} /> Proof
                                    </button>
                                  )}

                                  <button
                                    onClick={() => generateAndWhatsAppDoc(b, isCompleted ? "receipt" : "invoice")}
                                    className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all cursor-pointer shadow-xs"
                                    title="Download PDF and Send via WhatsApp to Student"
                                  >
                                    <MessageSquare size={11} className="text-emerald-600" />
                                    <span>WhatsApp {isCompleted ? "Receipt" : "Invoice"}</span>
                                  </button>

                                  {b.studentEmail && (
                                    <button
                                      onClick={() => generateAndSendPDFReceipt(b)}
                                      disabled={sendingPdfId === b.id}
                                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                        isCompleted
                                          ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                                          : "bg-blue-50 hover:bg-blue-105 text-blue-800 border-blue-250"
                                      }`}
                                      title="Generate and Send Official Receipt PDF"
                                    >
                                      {sendingPdfId === b.id ? (
                                        <Loader2 size={11} className="animate-spin text-blue-600" />
                                      ) : (
                                        <Mail size={11} className={isCompleted ? "text-emerald-600" : "text-blue-550"} />
                                      )}
                                      <span>{isCompleted ? "Email Receipt" : "Email Invoice"}</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      if (confirm(`Delete this deposit ledger record for ${b.studentName}? This will remove it from system logs permanently.`)) {
                                        onDeleteBooking(b.id);
                                      }
                                    }}
                                    className="bg-red-50 hover:bg-red-100/70 text-red-650 rounded-lg p-2 transition-all cursor-pointer inline-flex items-center shadow-2xs"
                                    title="Delete Deposit Record"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Custom Email Status Dialog Modal */}
        {emailStatusModal && emailStatusModal.show && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-100 flex flex-col my-8 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Header based on status */}
              {emailStatusModal.success && !emailStatusModal.simulated ? (
                <div className="bg-emerald-600 px-6 py-5 text-white flex items-center gap-3 shrink-0">
                  <div className="bg-emerald-700/50 p-2 rounded-full">
                    <CheckCircle2 size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base">{emailStatusModal.title}</h4>
                    <p className="text-[11px] text-emerald-100 font-medium">Digital Receipt Delivered securely</p>
                  </div>
                </div>
              ) : emailStatusModal.simulated ? (
                <div className="bg-blue-800 px-6 py-5 text-white flex items-center gap-3 shrink-0">
                  <div className="bg-blue-900/50 p-2 rounded-full">
                    <Clock size={24} className="text-blue-100" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base">{emailStatusModal.title}</h4>
                    <p className="text-[11px] text-blue-100 font-medium">Local sandbox verification screen</p>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-600 px-6 py-5 text-white flex items-center gap-3 shrink-0">
                  <div className="bg-rose-700/50 p-2 rounded-full">
                    <X size={24} className="text-white font-extrabold" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base">{emailStatusModal.title}</h4>
                    <p className="text-[11px] text-rose-100 font-medium">SMTP carrier dispatch problem</p>
                  </div>
                </div>
              )}

              {/* Scrollable Content Pane */}
              <div className="p-6 overflow-y-auto max-h-[65vh] space-y-4 text-xs font-medium text-neutral-600">
                <div className="bg-neutral-50 p-4 rounded-xl space-y-2 border border-neutral-100">
                  <div className="flex justify-between border-b pb-2 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    <span>Active Audit Record</span>
                    <span className="text-neutral-500 font-mono">REC-{emailStatusModal.booking?.id?.toUpperCase()}</span>
                  </div>
                  <p className="text-neutral-700 font-bold text-sm leading-relaxed">
                    {emailStatusModal.message}
                  </p>
                  {emailStatusModal.booking && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-500 pt-2 border-t font-normal">
                      <div>Student: <strong className="text-neutral-700 font-bold">{emailStatusModal.booking.studentName}</strong></div>
                      <div>Destination Email: <strong className="text-neutral-700 font-bold">{emailStatusModal.booking.studentEmail}</strong></div>
                    </div>
                  )}
                </div>

                {/* If simulated or error, display the inline SMTP Setup flow */}
                {(emailStatusModal.simulated || !emailStatusModal.success) && (
                  <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-blue-900 font-extrabold text-[10px] uppercase tracking-wider">
                      <Settings size={13} className="text-blue-700" />
                      <span>Configure & Enable Delivery to Client Email</span>
                    </div>
                    
                    <p className="text-[11px] leading-relaxed text-blue-950 font-medium">
                      {emailStatusModal.simulated 
                        ? "Currently, SMTP App Credentials are of standard state, meaning simulation is logged rather than hitting their mailbox." 
                        : "Email dispatch failed due to rejected credentials. Google SMTP requires you to save your personalized Google account settings."}
                      {" Follow the instructions below to enable instant delivery:"}
                    </p>

                    <div className="bg-white/80 p-3 rounded-lg border border-blue-100 space-y-2 text-[10.5px] leading-relaxed text-blue-900">
                      <p className="font-bold">Google Step-by-Step Security Setup:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-neutral-700 font-normal">
                        <li>Open <a href="https://myaccount.google.com" target="_blank" rel="noreferrer" className="text-blue-700 underline font-extrabold">myaccount.google.com</a> and sign in.</li>
                        <li>Turn on <strong>2-Step Verification</strong> on your Security tab.</li>
                        <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-blue-700 underline font-extrabold">Google App Passwords</a> and create an app profile named "Dopes Accommodations".</li>
                        <li>Copy the <strong>16-character code</strong> and enter it below.</li>
                      </ol>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase tracking-wider text-neutral-500 mb-1">
                          Sender Gmail Address
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-bold text-neutral-800 text-[11px]"
                          value={smtpUser}
                          onChange={(e) => setSmtpUser(e.target.value)}
                          placeholder="e.g. dopesaccommodationagency@gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase tracking-wider text-neutral-500 mb-0.5">
                          16-Character Google App Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-mono text-neutral-800 text-[11px]"
                          value={smtpPass}
                          onChange={(e) => setSmtpPass(e.target.value)}
                          placeholder="Pasted 16-digit code (excluding spaces)"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          if (!smtpUser.includes("@gmail.com")) {
                            alert("Please enter a valid @gmail.com address!");
                            return;
                          }
                          const cleanPass = smtpPass.trim().replace(/\s+/g, "");
                          if (cleanPass.length < 12) {
                            alert("Google App Passwords must contain a valid 16-character code!");
                            return;
                          }
                          
                          // Save dynamic credentials
                          localStorage.setItem("dopes_gmail_user", smtpUser.trim());
                          localStorage.setItem("dopes_gmail_app_password", cleanPass);
                          
                          // Close the current modal and run transmission logic
                          const activeBooking = emailStatusModal.booking;
                          setEmailStatusModal(null);
                          if (activeBooking) {
                            // Run email send with newly saved configs
                            await generateAndSendPDFReceipt(activeBooking);
                          }
                        }}
                        className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                      >
                        <Mail size={13} />
                        <span>Save & Transmit Real Email Now</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Technical / warning detail expansion */}
                {(emailStatusModal.warning || emailStatusModal.details) && (
                  <div className="bg-neutral-900 text-neutral-300 p-3.5 rounded-xl font-mono text-[10px] space-y-1.5">
                    <span className="text-rose-400 font-bold block uppercase text-[8px] tracking-wider">System Log & Troubleshooting Payload:</span>
                    {emailStatusModal.warning && <p className="font-bold text-rose-350">Reason: {emailStatusModal.warning}</p>}
                    {emailStatusModal.details && <p className="leading-relaxed whitespace-pre-wrap">Details: {emailStatusModal.details}</p>}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-neutral-50 border-t px-6 py-4 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setEmailStatusModal(null)}
                  className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-extrabold px-5 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Close Window
                </button>
              </div>

            </div>
          </div>
        )}

        {/* EcoCash Proof Preview Overlay */}
        {proofPreview && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-100">
              <div className="bg-neutral-950 px-6 py-4 flex items-center justify-between text-white">
                <div>
                  <h4 className="font-bold text-sm">EcoCash Proof of Payment</h4>
                  <p className="text-[10px] text-neutral-400">Submitted by: {previewBookingName}</p>
                </div>
                <button
                  onClick={() => setProofPreview(null)}
                  className="rounded-full bg-neutral-800 p-1.5 hover:bg-neutral-700 text-neutral-200 transition"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 bg-neutral-50 flex justify-center items-center max-h-[70vh] overflow-y-auto">
                <img 
                  src={proofPreview} 
                  alt="EcoCash Proof of Payment" 
                  className="max-w-full max-h-[60vh] object-contain rounded-lg border shadow-xs"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="bg-neutral-100 p-4 flex justify-end gap-2 border-t text-right">
                <a
                  href={proofPreview}
                  download={`EcoCash_Proof_${previewBookingName}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
                >
                  Download Image
                </a>
                <button
                  onClick={() => setProofPreview(null)}
                  className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold px-4 py-2 rounded-lg text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom SMTP Gmail Setup Modal Overlay */}
        {showSmtpSettings && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-100 flex flex-col">
              <div className="bg-blue-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-blue-300" />
                  <h4 className="font-bold text-sm">Gmail Manual SMTP Setup</h4>
                </div>
                <button
                  onClick={() => setShowSmtpSettings(false)}
                  className="rounded-full bg-blue-950 p-1.5 hover:bg-blue-800 text-neutral-200 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-6 bg-white overflow-y-auto max-h-[75vh] space-y-5 text-xs text-neutral-600 font-medium">
                <div className="bg-blue-50 border border-blue-250 text-blue-950 p-3.5 rounded-xl space-y-1">
                  <span className="font-extrabold text-blue-900 block uppercase tracking-wider text-[9px]">How to setup manual Gmail:</span>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Go to your Google Account: <a href="https://myaccount.google.com" target="_blank" rel="noreferrer" className="text-blue-700 underline font-bold">myaccount.google.com</a></li>
                    <li>Ensure <strong>2-Step Verification</strong> is active on your Account Security panel.</li>
                    <li>Search or go directly to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-blue-700 underline font-bold">myaccount.google.com/apppasswords</a></li>
                    <li>Create an app profile named <strong>"Dopes Portal"</strong> and copy the 16-character generated password code.</li>
                    <li>Paste your Gmail email address & App Password below. Click Save to authorize manual dispatch!</li>
                  </ol>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 mb-1">
                      Sender Gmail Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 bg-neutral-50 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-bold text-neutral-800"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="e.g. dopesaccommodationagency@gmail.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 mb-0.5">
                      Gmail App Password (16-char)
                    </label>
                    <p className="text-[10px] text-neutral-400 mb-1.5 font-normal">Never enter your standard Google Account password. Google requires the 16-character SMTP custom App Password code.</p>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-neutral-50 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden font-mono text-neutral-800 animate-pulse"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="e.g. abcd efgh ijkl mnop"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-neutral-50 px-6 py-4 flex justify-end gap-2.5 border-t shrink-0">
                <button
                  onClick={() => {
                    localStorage.removeItem("dopes_gmail_user");
                    localStorage.removeItem("dopes_gmail_app_password");
                    setSmtpUser("dopesaccommodationagency@gmail.com");
                    setSmtpPass("");
                    alert("SMTP credentials reset to default configurations!");
                  }}
                  className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 hover:text-neutral-800 px-4 py-2 rounded-xl text-xs transition cursor-pointer font-bold"
                >
                  Clear Config
                </button>
                <button
                  onClick={() => {
                    if (!smtpUser.includes("@gmail.com")) {
                      alert("Validation error: Gmail sender address must be a valid @gmail.com address!");
                      return;
                    }
                    if (smtpPass.length > 0 && smtpPass.replace(/\s+/g, "").length < 12) {
                      alert("Validation warning: The app password looks shorter than standard 16 characters. Please double check that you copy-pasted the SMTP APP PASSWORD generated by Google security.");
                    }
                    localStorage.setItem("dopes_gmail_user", smtpUser.trim());
                    localStorage.setItem("dopes_gmail_app_password", smtpPass.trim().replace(/\s+/g, ""));
                    alert("Success! Your Google App SMTP Credentials are now active and synchronized locally.");
                    setShowSmtpSettings(false);
                  }}
                  className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Save Active settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Toast Notification Popup */}
        {toast && toast.show && (
          <div className="fixed bottom-6 right-6 z-60 bg-neutral-900 text-white font-bold text-xs px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200 border border-neutral-850">
            <div className="bg-emerald-500/20 p-1.5 rounded-full ring-4 ring-emerald-500/5">
              <CheckCircle2 size={16} className="text-emerald-500 animate-bounce" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-[12px] font-black">{toast.message}</span>
              <span className="text-[10px] text-neutral-400 font-normal mt-0.5">Database log updated successfully</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
