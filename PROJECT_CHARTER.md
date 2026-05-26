# Project Charter: MSU Student Accommodation Portal (Dopes' Accommodation)

## 1. Project Overview & Context
The **Midlands State University (MSU) Student Accommodation Portal** (popularly known as *Dopes' Accommodation*) is a premium, full-stack student housing directory and real-time booking application. 

Off-campus student life in Gweru, Zimbabwe, presents significant logistical friction. Students attending Midlands State University across different learning centers find it challenging to source trusted, secure, and utility-stable accommodation options. This system acts as a centralized repository and dynamic booking agent, connecting students with certified, vetted rooms around MSU Main Campus, Batanai Campus, and TelOne Campus.

---

## 2. Problem Statement & Project Vision

### Problem Statement
Over 20,000 students enrolled at Midlands State University face annual housing deficits. Off-campus boarding search is currently riddled with:
*   **Inaccurate or Outdated Data:** Physical brochures or unsorted chat groups misleading students about available slots and pricing.
*   **Proximity Miscalculations:** Students mistakenly booking rooms thinking they are adjacent to their department, only to discover long daily commutes.
*   **Utility Instability:** Essential services like backup solar power, borehole water, and active Wi-Fi are hard to guarantee or verify without visiting.
*   **Opaque Fees:** High middleman fees with zero tracking or immediate reservation feedback.

### Project Vision
To build a highly responsive, real-time, vetted student housing marketplace that enables MSU students to browse, filter, inspect utility badges, verify accurate walk-times to specific campuses, and instantly book rooms with automatic, transparent agency fee structures.

---

## 3. Project Objectives & Success Criteria

| Objective | Target Metrics | Measurement Method |
| :--- | :--- | :--- |
| **Real-time Synchronization** | Under 1-second delay for slot count changes across multiple active users | Firestore real-time listener monitors |
| **Accurate Location Mapping** | 100% accurate distance computations to Main, Batanai, and TelOne gates | Static proximity telemetry verification |
| **Secure Reservation Portal** | Zero over-reservations or duplicate slot grabs | Atomic decrement operations and conditional card status locking |
| **Admin Control Efficiency** | Listing additions, slot modifications, and booking complete toggles take < 30 seconds | User Experience (UX) workflow audits |

---

## 4. Key Stakeholders

*   **Project Sponsor & Owner:** pdondo14 (pdondo14@gmail.com) / Dopes' Projects
*   **Midlands State University Students:** Primary end-users searching for secure housing matching their gender limits, budget, and specific campus location.
*   **Verified Accommodation Agents / Admins:** Manage housing listings, maintain price/utility updates, receive incoming reservations, and collect the baseline allocation agent fee.
*   **Property Owners (Gweru Suburb Landlords):** List and advertise single rooms, cottages, and shared hostel layouts across Nehosho, Senga, Windsor Park, and KMP.

---

## 5. Scope Definition

### In-Scope (Core Deliverables)
1.  **Vibrant Student Browsing Interface:** Highly responsive list of luxury, standard, and budget accommodations.
2.  **Advanced Utility Filtering:** Search terms matched against title, description, or features plus immediate filters for Location and Room Type.
3.  **Campus Proximity Indicators:** A real-time calculated distance grid displaying precise distances (in km) to the **MSU Main Campus**, **Batanai Campus**, and **TelOne Campus**.
4.  **Instant Registration Modal:** Simple student-facing form capturing name, contact digits, gender, head count, move-in window, and notes.
5.  **Dynamic Brokerage Fee Engine:** Automatic, real-time projection of the agent fee structured as **Heads Count * $20 USD** displayed during booking summary.
6.  **Protected Administration Dashboard:** Dedicated secure view for adding new listings with custom feature-arrays, editing pricing/availability, reviewing active bookings, and checking off completed listings.
7.  **Real-Time Firestore Backbone:** Syncing active slots, reservations, and house capacities to prevent static page state mismatch.

### Out-of-Scope (Future Iterations)
*   Direct online Stripe/Debit Card processing (all bookings are secured on-site, and fees are processed cash-on-visit or via Ecocash setup verified by agent).
*   Live audio/video calling panels between student and landlord (handled by the system via telephone numbers provided in bookings).
*   Automated automated coordinate plotting (handled fast and securely by the system's hardcoded campus coordinates and local distance matrix computations).

---

## 6. Technical Architecture & Component Structure

```
                         [ React 19 Frontend (Vite) ]
                                      |
                     +----------------+----------------+
                     |                                 |
         [ Public Student View ]             [ Admin Dashboard View ]
          - Search & Filtering                - Add/Edit Accommodations
          - Proximity Checklist               - Live Booking Manager
          - Reservation Booking Modal         - Complete/Remove Toggles
                     |                                 |
                     +----------------+----------------+
                                      |
                         [ Real-Time Data Sync ]
                                      |
                    [ Firebase Firestore database ]
                     - Coll: "houses" (Capacity & Details)
                     - Coll: "bookings" (Student Queries & Status)
```

### Software Stack Configuration
*   **Framework:** React 19, TypeScript
*   **Build Bundler:** Vite 6
*   **Database:** Cloud Firestore (Firebase Web SDK)
*   **Styling:** Tailwind CSS 4, Lucide React (Icons)
*   **State Management:** React hooks (`useState`, `useEffect`) listening to Firestore snapshot handlers.

---

## 7. Project Milestones & Progress

*   [x] **Milestone 1: Project Definition & Brand Guidelines** (Completed) - Defined locations, room options, and pricing margins for Gweru suburbs.
*   [x] **Milestone 2: Database Schema & Utilities Provisioning** (Completed) - Structured `House` and `Booking` interfaces in `types.ts` with Firestore connectors in `firebaseUtils.ts`.
*   [x] **Milestone 3: Core Client Interface Delivery** (Completed) - Built the beautiful responsive landing web page with hero banners, search panels, and accommodation cards.
*   [x] **Milestone 4: Form Reservation Engine Implementation** (Completed) - Formulated the Booking Modal with autoagent fees calculations.
*   [x] **Milestone 5: Admin Dashboard Launch** (Completed) - Mounted the Admin Modal with credential guardrails, and listings modification capacities.
*   [ ] **Milestone 6: Production CI/CD Setup** (In Progress) - Resolving Vercel/GitHub import configurations to support smooth deployment onto user’s personal repositories.

---

## 8. Risk Register & Mitigation Strategy

| Risk ID | Description | Impact | Probability | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | Internet drops during active student reservation process | Medium | High | **Firestore Offline Persistence:** Active configurations synchronize queues locally and commit changes immediately upon reconnecting. |
| **R-02** | Simultaneous double-booking of last remaining slot | High | Low | **Atomic Decrements:** The transaction verifies remaining availability at state check-in before executing reservations. |
| **R-03** | Fake bookings clogging up property slot capacity | Medium | Medium | **Admin Manual Check:** Bookings are verified through a quick phone call, and admin controls can instantly delete custom spam entries in one click. |

---

## 9. Alignment & Approval
This charter sets forth the baseline operational blueprint for the **MSU Student Accommodation Portal**. Changes to the core scope or architectural stack must be aligned with the stakeholders' goals of providing safe, accessible, and fast housing support answers for Zimbabwean university students.
