import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { normaliseEmail } from "./config";

const DATA_FILE = join(process.cwd(), "private", "users.json");
const DATA_DIR = dirname(DATA_FILE);

export interface UserRecord {
  email: string;
  name: string;
  phone?: string;
  passwordHash?: string;
  via: "password";
  createdAt: number;
}

function readAll(): Record<string, UserRecord> {
  if (!existsSync(DATA_FILE)) return {};
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf8")) as Record<string, UserRecord>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, UserRecord>): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export function findUserByEmail(email: string): UserRecord | undefined {
  const key = normaliseEmail(email);
  const data = readAll();
  return data[key];
}

export function createUser(record: Omit<UserRecord, "createdAt">): UserRecord {
  const key = normaliseEmail(record.email);
  const data = readAll();
  if (data[key]) {
    throw new Error("User already exists.");
  }
  const user: UserRecord = { ...record, createdAt: Date.now() };
  data[key] = user;
  writeAll(data);
  return user;
}

export function updateUserPassword(email: string, passwordHash: string): UserRecord {
  const key = normaliseEmail(email);
  const data = readAll();
  const existing = data[key];
  if (!existing) throw new Error("User not found.");
  existing.passwordHash = passwordHash;
  writeAll(data);
  return existing;
}
