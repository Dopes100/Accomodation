import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebase";
import { House, Booking, INITIAL_HOUSES } from "./types";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Initializes the houses collection with local fallback data if Firestore database is empty.
 */
export async function initializeDatabaseIfEmpty() {
  const path = "houses";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    if (querySnapshot.empty) {
      console.log("Firestore houses collection is empty. Seed initializing with realistic MSU listings...");
      const batch = writeBatch(db);
      INITIAL_HOUSES.forEach((house) => {
        const docRef = doc(db, path, house.id);
        batch.set(docRef, house);
      });
      await batch.commit();
      console.log("MSU listings initialized successfully.");
    } else {
      // Ensure h12, h13, h14 listings exist in Firestore so they are present if deleted,
      // but NEVER overwrite them if they already exist, preserving all admin modifications.
      const criticalListingIds = ["h12", "h13", "h14"];
      for (const id of criticalListingIds) {
        const docRef = doc(db, path, id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          console.log(`Seeding missing critical listing ${id} to Firestore...`);
          const targetHouse = INITIAL_HOUSES.find((h) => h.id === id);
          if (targetHouse) {
            await setDoc(docRef, targetHouse);
            console.log(`Seeded critical listing ${id} successfully.`);
          }
        }
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Sets up a dynamic real-time subscription for all house listings.
 */
export function subscribeToHouses(onUpdate: (houses: House[]) => void, onError?: (err: unknown) => void) {
  const path = "houses";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const housesList: House[] = [];
      snapshot.forEach((doc) => {
        housesList.push({ id: doc.id, ...doc.data() } as House);
      });
      onUpdate(housesList);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Sets up a dynamic real-time subscription for booking requests.
 */
export function subscribeToBookings(onUpdate: (bookings: Booking[]) => void, onError?: (err: unknown) => void) {
  const path = "bookings";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const bookingsList: Booking[] = [];
      snapshot.forEach((doc) => {
        bookingsList.push({ id: doc.id, ...doc.data() } as Booking);
      });
      // Sort bookings by timestamp descending (newest first)
      bookingsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(bookingsList);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Utility helper to recursively sanitize objects for Firestore by removing any keys with 'undefined' values.
 * This ensures batch.set, setDoc, and updateDoc operations never crash due to unsupported undefined types.
 */
function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    // Firestore accepts null but not undefined
    return (data === undefined ? null : data) as any;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === "object") {
    const cleaned: any = {};
    for (const key of Object.keys(data as any)) {
      const val = (data as any)[key];
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    }
    return cleaned;
  }
  return data;
}

/**
 * Adds or updates a house listing in Firestore.
 */
export async function saveHouseToFirestore(house: House) {
  const path = `houses/${house.id}`;
  try {
    await setDoc(doc(db, "houses", house.id), sanitizeForFirestore(house));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a house listing from Firestore.
 */
export async function deleteHouseFromFirestore(id: string) {
  const path = `houses/${id}`;
  try {
    await deleteDoc(doc(db, "houses", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Submits a new booking to Firestore AND subtracts slots from the accommodation.
 */
export async function submitBookingToFirestore(booking: Booking, currentHouse: House) {
  const batch = writeBatch(db);
  const bookingPath = `bookings/${booking.id}`;
  const housePath = `houses/${currentHouse.id}`;

  try {
    // 1. Create booking document
    const bookingRef = doc(db, "bookings", booking.id);
    batch.set(bookingRef, sanitizeForFirestore(booking));

    // 2. Subtract slots on the referenced house
    const remainingSlots = Math.max(0, currentHouse.availableSlots - booking.headsCount);
    
    // Also subtract slots for the selected room option if applicable
    let updatedRoomOptions = currentHouse.roomOptions;
    if (booking.roomOptionId && currentHouse.roomOptions) {
      updatedRoomOptions = currentHouse.roomOptions.map((opt) => {
        if (opt.id === booking.roomOptionId) {
          const newSlots = Math.max(0, opt.availableSlots - booking.headsCount);
          return {
            ...opt,
            availableSlots: newSlots
          };
        }
        return opt;
      });
    }

    const updatedHouse = {
      ...currentHouse,
      availableSlots: remainingSlots,
      isAvailable: remainingSlots > 0,
      ...(updatedRoomOptions ? { roomOptions: updatedRoomOptions } : {})
    };
    const houseRef = doc(db, "houses", currentHouse.id);
    batch.set(houseRef, sanitizeForFirestore(updatedHouse));

    // Commit atomic transaction
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${bookingPath} & ${housePath}`);
  }
}

/**
 * Deletes a booking from Firestore.
 */
export async function deleteBookingFromFirestore(id: string) {
  const path = `bookings/${id}`;
  try {
    await deleteDoc(doc(db, "bookings", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Toggles booking completion status.
 */
export async function toggleBookingCompletedInFirestore(booking: Booking) {
  const path = `bookings/${booking.id}`;
  try {
    const updated = { ...booking, completed: !booking.completed };
    await setDoc(doc(db, "bookings", booking.id), sanitizeForFirestore(updated));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes all bookings from Firestore.
 */
export async function deleteAllBookingsFromFirestore() {
  const path = "bookings";
  try {
    const querySnapshot = await getDocs(collection(db, "bookings"));
    if (querySnapshot.empty) return;
    
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Saves SMTP configuration to Firestore settings collection.
 */
export async function saveSMTPSettingsToFirestore(smtpUser: string, smtpPass: string) {
  const path = "settings/smtp";
  try {
    await setDoc(doc(db, "settings", "smtp"), {
      smtpUser: smtpUser.trim(),
      smtpPass: smtpPass.trim(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Loads SMTP configuration from Firestore settings collection.
 */
export async function getSMTPSettingsFromFirestore() {
  const path = "settings/smtp";
  try {
    const docSnap = await getDoc(doc(db, "settings", "smtp"));
    if (docSnap.exists()) {
      return docSnap.data() as { smtpUser: string; smtpPass: string; updatedAt?: string };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Updates a booking with custom properties.
 */
export async function updateBookingInFirestore(bookingId: string, updates: Partial<Booking>) {
  const path = `bookings/${bookingId}`;
  try {
    const docSnap = await getDoc(doc(db, "bookings", bookingId));
    if (docSnap.exists()) {
      const currentData = docSnap.data() as Booking;
      const updated = { ...currentData, ...updates };
      await setDoc(doc(db, "bookings", bookingId), sanitizeForFirestore(updated));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}



