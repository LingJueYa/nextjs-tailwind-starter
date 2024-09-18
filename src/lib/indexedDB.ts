// indexedDB
import { openDB } from "idb";

const DB_NAME = ""; // required
const STORE_NAME = ""; // required

export const initDB = async () => {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
  return db;
};

// 设置数据
export const setItem = async (key: string, value: unknown) => {
  const db = await initDB();
  await db.put(STORE_NAME, value, key);
};
// 获取数据
export const getItem = async (key: string) => {
  const db = await initDB();
  return await db.get(STORE_NAME, key);
};
// 更新数据
export const updateItem = async (key: string, value: unknown) => {
  await setItem(key, value);
};
// 删除数据
export const deleteItem = async (key: string) => {
  const db = await initDB();
  await db.delete(STORE_NAME, key);
};
// 清空数据
export const clearStore = async () => {
  const db = await initDB();
  await db.clear(STORE_NAME);
};
