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
      // Robust synchronization of the brand-new h12 house listing
      const h12Ref = doc(db, path, "h12");
      const h12Snap = await getDoc(h12Ref);
      if (!h12Snap.exists()) {
        console.log("Synchronizing h12 listing to Firestore...");
        const targetHouse = INITIAL_HOUSES.find((h) => h.id === "h12");
        if (targetHouse) {
          await setDoc(h12Ref, targetHouse);
          console.log("Synchronized h12 successfully.");
        }
      } else {
        // Overwrite or update to sync locally-enhanced image paths and KMP ZESA location
        const existingData = h12Snap.data();
        const targetHouse = INITIAL_HOUSES.find((h) => h.id === "h12");
        if (targetHouse) {
          const hasOldImages = existingData?.images?.some((img: string) => img.includes("unsplash.com"));
          const hasOldLocation = existingData?.location?.includes("Nehosho");
          
          // Deep check if images list size or values differ, or location differs
          const imagesMismatch = !existingData?.images || 
            existingData.images.length !== targetHouse.images.length ||
            existingData.images.some((val: string, idx: number) => val !== targetHouse.images[idx]);
          
          const locationMismatch = existingData?.location !== targetHouse.location;
          const titleMismatch = existingData?.title !== targetHouse.title;
          const descMismatch = existingData?.description !== targetHouse.description;
          const bookingLockedMismatch = existingData?.bookingLocked !== targetHouse.bookingLocked;
          const isAvailableMismatch = existingData?.isAvailable !== targetHouse.isAvailable;

          if (hasOldImages || hasOldLocation || imagesMismatch || locationMismatch || titleMismatch || descMismatch || bookingLockedMismatch || isAvailableMismatch) {
            console.log("Synchronizing updated h12 listing (new KMP ZESA location, locally-enhanced photos, description, and locked booking status) to Firestore...");
            await setDoc(h12Ref, targetHouse); // Complete overwrite to purge any oversized corrupt/bloat attributes of old images
            console.log("Synchronized h12 updates successfully.");
          }
        }
      }

      // Robust synchronization of the brand-new h13 house listing (Psalms Villa)
      const h13Ref = doc(db, path, "h13");
      const h13Snap = await getDoc(h13Ref);
      if (!h13Snap.exists()) {
        console.log("Synchronizing h13 listing (Psalms Villa) to Firestore...");
        const targetHouse = INITIAL_HOUSES.find((h) => h.id === "h13");
        if (targetHouse) {
          await setDoc(h13Ref, targetHouse);
          console.log("Synchronized h13 successfully.");
        }
      } else {
        const existingData = h13Snap.data();
        const targetHouse = INITIAL_HOUSES.find((h) => h.id === "h13");
        if (targetHouse) {
          // Deep check if images list size or values differ, or location or options differ
          const imagesMismatch = !existingData?.images || 
            existingData.images.length !== targetHouse.images.length ||
            existingData.images.some((val: string, idx: number) => val !== targetHouse.images[idx]);
          
          const locationMismatch = existingData?.location !== targetHouse.location;
          const titleMismatch = existingData?.title !== targetHouse.title;
          const descMismatch = existingData?.description !== targetHouse.description;

          if (imagesMismatch || locationMismatch || titleMismatch || descMismatch) {
            console.log("Synchronizing updated h13 listing (Psalms Villa) to Firestore...");
            await setDoc(h13Ref, targetHouse); // Complete overwrite to purge any oversized/corrupt attributes
            console.log("Synchronized h13 updates successfully.");
          }
        }
      }

      // Robust synchronization of the brand-new h14 house listing (Diagonal Opposite Allana House)
      const h14Ref = doc(db, path, "h14");
      const h14Snap = await getDoc(h14Ref);
      if (!h14Snap.exists()) {
        console.log("Synchronizing h14 listing (Diagonal Opposite Allana) to Firestore...");
        const targetHouse = INITIAL_HOUSES.find((h) => h.id === "h14");
        if (targetHouse) {
          await setDoc(h14Ref, targetHouse);
          console.log("Synchronized h14 successfully.");
        }
      } else {
        const existingData = h14Snap.data();
        const targetHouse = INITIAL_HOUSES.find((h) => h.id === "h14");
        if (targetHouse) {
          const titleMismatch = existingData?.title !== targetHouse.title;
          const descMismatch = existingData?.description !== targetHouse.description;
          const locationMismatch = existingData?.location !== targetHouse.location;
          const improvementsMismatch = existingData?.underImprovements !== targetHouse.underImprovements;

          if (titleMismatch || descMismatch || locationMismatch || improvementsMismatch) {
            console.log("Synchronizing updated h14 listing (Diagonal Opposite Allana) to Firestore...");
            await setDoc(h14Ref, targetHouse); // Complete overwrite to purge any oversized/corrupt attributes
            console.log("Synchronized h14 updates successfully.");
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



