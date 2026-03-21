import { openDB } from 'idb';

const DB_NAME = 'GateGuardDB';
const STORE_NAME = 'pendingLogs';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    },
  });
};

export const savePendingLog = async (log: any) => {
  const db = await initDB();
  await db.put(STORE_NAME, log);
};

export const getPendingLogs = async () => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

export const deletePendingLog = async (id: string) => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};
