# Security Specification for DOPES MSU Student Accommodation

## Data Invariants
1. Houses must have a unique ID, valid roomType, genderLimit, and availableSlots.
2. Bookings must reference a valid houseId and include studentName and studentPhone.
3. Access to Houses is public read (since anyone can browse accommodation), and public write for editing/creation (since this app uses client-side passcode authentication "Dopes@07").
4. Access to Bookings is public create (so students can make bookings), and public read/write (for the management consortium to manage them).

## The "Dirty Dozen" Payloads (Examples)
1. Creating a house listing without a unique ID.
2. Creating a house listing with negative slots or price.
3. Creating a booking without a studentName.
4. Setting a negative availableSlots on a house listing.

## Test Runner (Conceptual)
Since we are using direct client-side operations on Houses and Bookings, the security rules will allow global read/write on `/houses/{houseId}` and `/bookings/{bookingId}` to allow real-time collaborative updates on any device.
