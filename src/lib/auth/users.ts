import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { Redis } from "@upstash/redis";
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

const redisUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | undefined;
function getRedis(): Redis | undefined {
  if (!redis && redisUrl && redisToken) {
    redis = new Redis({ url: redisUrl, token: redisToken, automaticDeserialization: false });
  }
  return redis;
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

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const key = normaliseEmail(email);
  const r = getRedis();
  if (r) {
    const raw = await r.get<string>(`user:${key}`);
    if (typeof raw === "string") {
      return JSON.parse(raw) as UserRecord;
    }
    return undefined;
  }
  const data = readAll();
  return data[key];
}

export async function createUser(record: Omit<UserRecord, "createdAt">): Promise<UserRecord> {
  const key = normaliseEmail(record.email);
  const r = getRedis();
  if (r) {
    const existing = await r.get<string>(`user:${key}`);
    if (existing) throw new Error("User already exists.");
    const user: UserRecord = { ...record, createdAt: Date.now() };
    await r.set(`user:${key}`, JSON.stringify(user));
    return user;
  }
  const data = readAll();
  if (data[key]) {
    throw new Error("User already exists.");
  }
  const user: UserRecord = { ...record, createdAt: Date.now() };
  data[key] = user;
  writeAll(data);
  return user;
}

export async function updateUserPassword(email: string, passwordHash: string): Promise<UserRecord> {
  const key = normaliseEmail(email);
  const r = getRedis();
  if (r) {
    const raw = await r.get<string>(`user:${key}`);
    if (!raw) throw new Error("User not found.");
    const existing = JSON.parse(raw) as UserRecord;
    existing.passwordHash = passwordHash;
    await r.set(`user:${key}`, JSON.stringify(existing));
    return existing;
  }
  const data = readAll();
  const existing = data[key];
  if (!existing) throw new Error("User not found.");
  existing.passwordHash = passwordHash;
  writeAll(data);
  return existing;
}
