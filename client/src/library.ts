import type { IllustrationMode } from "@shared/contract";

const DB_NAME = "margination";
const STORE = "illustrations";
const VERSION = 1;

export type LibraryRecord = {
  id: string;
  passage: string;
  createdAt: string;
  mimeType: string;
  image: Blob;
  mode: IllustrationMode;
  notice: string | null;
  model: string | null;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function listIllustrations(): Promise<LibraryRecord[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onsuccess = () => {
      const rows = request.result as LibraryRecord[];
      rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      resolve(rows);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveIllustration(record: LibraryRecord): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteIllustration(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
