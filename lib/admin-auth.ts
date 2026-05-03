import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

const ADMIN_COOKIE_NAME = "word-test-admin";
const ADMIN_PASSWORD = "DzQBO3kWvpPWgVf0yr9nshigc69fhK0wsNJYTImuEbM=";

function signValue(value: string) {
  return createHmac("sha256", env.betterAuthSecret).update(value).digest("hex");
}

function makeCookieValue() {
  const issuedAt = Date.now().toString();
  const signature = signValue(issuedAt);
  return `${issuedAt}.${signature}`;
}

function verifyCookieValue(value: string) {
  const [issuedAt, signature] = value.split(".");

  if (!issuedAt || !signature) {
    return false;
  }

  const expected = signValue(issuedAt);
  const safeExpected = Buffer.from(expected);
  const safeActual = Buffer.from(signature);

  if (safeExpected.length !== safeActual.length) {
    return false;
  }

  const maxAge = 1000 * 60 * 60 * 12;
  const age = Date.now() - Number(issuedAt);

  return Number.isFinite(age) && age >= 0 && age <= maxAge && timingSafeEqual(safeExpected, safeActual);
}

export function isAdminPassword(value: string) {
  return value === ADMIN_PASSWORD;
}

export async function hasAdminAccess() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return adminCookie ? verifyCookieValue(adminCookie) : false;
}

export async function setAdminAccessCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, makeCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: env.appUrl.startsWith("https://"),
    maxAge: 60 * 60 * 12,
    path: "/",
  });
}

export async function clearAdminAccessCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
