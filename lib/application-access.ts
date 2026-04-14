import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const APPLICATION_ACCESS_COOKIE_PREFIX = "application_access_";
const APPLICATION_ACCESS_MAX_AGE_SECONDS = 60 * 60 * 24;
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "6B4LGoNHcW553UjKgKkJ/rvdoNOPv8OSazQg3OCOlRU=",
);

export function getApplicationAccessCookieName(applicationId: string) {
  return `${APPLICATION_ACCESS_COOKIE_PREFIX}${applicationId}`;
}

export type ApplicationAccessPhonePreview = {
  prefix: string;
  suffix: string;
};

export function normalizePhoneNumber(phone: string) {
  return phone.replace(/\D/g, "");
}

export function extractPhoneLastFour(phone: string) {
  const normalizedPhone = normalizePhoneNumber(phone);

  if (normalizedPhone.length < 4) {
    return "";
  }

  return normalizedPhone.slice(-4);
}

export function getPhonePreview(
  phone: string | null | undefined,
): ApplicationAccessPhonePreview | null {
  if (!phone) {
    return null;
  }

  const normalizedPhone = normalizePhoneNumber(phone);

  if (normalizedPhone.length < 11) {
    return null;
  }

  return {
    prefix: normalizedPhone.slice(0, -4),
    suffix: "",
  };
}

export function isPhoneLastFour(value: string) {
  return /^\d{4}$/.test(value);
}

export function matchesGuardianPhone(
  application: {
    guardian1Phone: string;
    guardian2Phone: string | null;
  },
  rawPhoneLastFour: string,
) {
  const normalizedLastFour = normalizePhoneNumber(rawPhoneLastFour);

  if (!isPhoneLastFour(normalizedLastFour)) {
    return false;
  }

  return [application.guardian1Phone, application.guardian2Phone]
    .filter((phone): phone is string => Boolean(phone))
    .map((phone) => extractPhoneLastFour(phone))
    .includes(normalizedLastFour);
}

export async function createApplicationAccessToken(applicationId: string) {
  return new SignJWT({ applicationId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(SECRET_KEY);
}

export async function verifyApplicationAccessToken(
  token: string,
  applicationId: string,
) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.applicationId === applicationId;
  } catch {
    return false;
  }
}

export async function setApplicationAccessCookie(applicationId: string) {
  const cookieStore = await cookies();
  const token = await createApplicationAccessToken(applicationId);

  cookieStore.set(getApplicationAccessCookieName(applicationId), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/application",
    maxAge: APPLICATION_ACCESS_MAX_AGE_SECONDS,
  });
}

export async function readApplicationAccessCookie(applicationId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getApplicationAccessCookieName(applicationId))
    ?.value;

  if (!token) {
    return false;
  }

  return verifyApplicationAccessToken(token, applicationId);
}
