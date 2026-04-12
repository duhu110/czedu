"use server";

import prisma from "@/lib/prisma";
import {
  getPhonePreview,
  matchesGuardianPhone,
  setApplicationAccessCookie,
  type ApplicationAccessPhonePreview,
} from "@/lib/application-access";

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_WINDOW_MS = 60 * 60 * 1000;
const GENERIC_FAILURE_MESSAGE = "手机号不正确或无权访问";
const LOCKED_MESSAGE = "当前申请暂时无法验证，请 1 小时后再试";

export type VerifyApplicationAccessResult = {
  success: boolean;
  error: string | null;
  remainingAttempts: number;
  lockedUntil: Date | null;
};

export async function getApplicationAccessPreviews(
  applicationId: string,
): Promise<ApplicationAccessPhonePreview[]> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      guardian1Phone: true,
      guardian2Phone: true,
    },
  });

  if (!application) {
    return [];
  }

  return [application.guardian1Phone, application.guardian2Phone]
    .map((phone) => getPhonePreview(phone))
    .filter((preview): preview is ApplicationAccessPhonePreview => Boolean(preview));
}

function isStillLocked(lockedUntil: Date | null | undefined, now: Date) {
  return Boolean(lockedUntil && lockedUntil.getTime() > now.getTime());
}

async function persistFailure(
  applicationId: string,
  failedCount: number,
  now: Date,
) {
  const lockedUntil =
    failedCount >= MAX_FAILED_ATTEMPTS
      ? new Date(now.getTime() + LOCKOUT_WINDOW_MS)
      : null;

  await prisma.applicationAccessAttempt.upsert({
    where: { applicationId },
    create: {
      applicationId,
      failedCount,
      lastFailedAt: now,
      lockedUntil,
    },
    update: {
      failedCount,
      lastFailedAt: now,
      lockedUntil,
    },
  });

  return {
    success: false,
    error: lockedUntil ? LOCKED_MESSAGE : GENERIC_FAILURE_MESSAGE,
    remainingAttempts: lockedUntil
      ? 0
      : Math.max(0, MAX_FAILED_ATTEMPTS - failedCount),
    lockedUntil,
  } satisfies VerifyApplicationAccessResult;
}

export async function verifyApplicationAccess(
  applicationId: string,
  phone: string,
): Promise<VerifyApplicationAccessResult> {
  const now = new Date();
  const attempt = await prisma.applicationAccessAttempt.findUnique({
    where: { applicationId },
  });

  if (isStillLocked(attempt?.lockedUntil, now)) {
    return {
      success: false,
      error: LOCKED_MESSAGE,
      remainingAttempts: 0,
      lockedUntil: attempt?.lockedUntil ?? null,
    };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      guardian1Phone: true,
      guardian2Phone: true,
    },
  });

  if (!application || !matchesGuardianPhone(application, phone)) {
    const baseFailedCount =
      attempt?.lockedUntil && attempt.lockedUntil.getTime() <= now.getTime()
        ? 0
        : (attempt?.failedCount ?? 0);

    return persistFailure(applicationId, baseFailedCount + 1, now);
  }

  await prisma.applicationAccessAttempt.upsert({
    where: { applicationId },
    create: {
      applicationId,
      failedCount: 0,
      lockedUntil: null,
      lastFailedAt: null,
      lastSuccessAt: now,
    },
    update: {
      failedCount: 0,
      lockedUntil: null,
      lastFailedAt: null,
      lastSuccessAt: now,
    },
  });

  await setApplicationAccessCookie(applicationId);

  return {
    success: true,
    error: null,
    remainingAttempts: MAX_FAILED_ATTEMPTS,
    lockedUntil: null,
  };
}
