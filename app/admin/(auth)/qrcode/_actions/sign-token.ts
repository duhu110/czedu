"use server";

import { signQrToken } from "@/lib/qrcode-token";

export async function signQrTokenAction(
  token: string,
  expiresAt: string,
): Promise<string> {
  return signQrToken(token, expiresAt);
}
