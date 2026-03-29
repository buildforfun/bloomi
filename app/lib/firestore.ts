import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { CalendarEvent } from "./types";

// Strip undefined values — Firestore rejects them
function cleanEvent(event: CalendarEvent): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(event)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

function eventsCollection(userId: string) {
  return collection(db, "users", userId, "events");
}

export async function getEventsFromFirestore(
  userId: string
): Promise<CalendarEvent[]> {
  const q = query(eventsCollection(userId));
  const snapshot = await getDocs(q);
  const events: CalendarEvent[] = [];
  snapshot.forEach((docSnap) => {
    events.push(docSnap.data() as CalendarEvent);
  });
  return events;
}

// Real-time listener for events
export function subscribeToEvents(
  userId: string,
  callback: (events: CalendarEvent[]) => void
): () => void {
  const q = query(eventsCollection(userId));
  return onSnapshot(q, (snapshot) => {
    const events: CalendarEvent[] = [];
    snapshot.forEach((docSnap) => {
      events.push(docSnap.data() as CalendarEvent);
    });
    callback(events);
  });
}

export async function saveEventToFirestore(
  userId: string,
  event: CalendarEvent
): Promise<void> {
  const docRef = doc(db, "users", userId, "events", event.id);
  await setDoc(docRef, cleanEvent(event));
}

export async function deleteEventFromFirestore(
  userId: string,
  eventId: string
): Promise<void> {
  const docRef = doc(db, "users", userId, "events", eventId);
  await deleteDoc(docRef);
}

export async function updateEventInFirestore(
  userId: string,
  event: CalendarEvent
): Promise<void> {
  const docRef = doc(db, "users", userId, "events", event.id);
  await setDoc(docRef, cleanEvent(event), { merge: true });
}
