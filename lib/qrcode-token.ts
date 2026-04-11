import { createHmac, timingSafeEqual } from "crypto";

/** 二维码 token 有效期（秒），从 issuedAt 起算 */
export const QR_VALIDATION_WINDOW_SECONDS = 180;

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
};

/**
 * 对 token + expiresAt 做 HMAC-SHA256 签名
 * 返回 hex 编码的签名字符串
 */
export function signQrToken(token: string, expiresAt: string): string {
  return createHmac("sha256", getSecret())
    .update(`${token}|${expiresAt}`)
    .digest("hex");
}

/**
 * 验证二维码 token 签名 + 过期时间
 * 返回 { valid, reason? }
 */
export function verifyQrToken(
  token: string,
  expiresAt: string,
  sig: string,
): { valid: boolean; reason?: string } {
  const expected = signQrToken(token, expiresAt);

  const sigBuf = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(expected, "hex");

  if (
    sigBuf.length !== expectedBuf.length ||
    !timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return { valid: false, reason: "invalid_signature" };
  }

  if (new Date(expiresAt).getTime() < Date.now()) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true };
}

// ========== 编辑 Token（驳回修改用，无过期时间） ==========

/**
 * 对 EDIT-{applicationId} 做 HMAC-SHA256 签名
 * 返回 hex 编码的签名字符串
 */
export function signEditToken(applicationId: string): string {
  return createHmac("sha256", getSecret())
    .update(`EDIT-${applicationId}`)
    .digest("hex");
}

/**
 * 验证编辑 token 签名（不校验过期时间，由数据库 EDITING 状态控制有效性）
 * 返回 { valid, reason? }
 */
export function verifyEditToken(
  applicationId: string,
  sig: string,
): { valid: boolean; reason?: string } {
  const expected = signEditToken(applicationId);

  const sigBuf = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(expected, "hex");

  if (
    sigBuf.length !== expectedBuf.length ||
    !timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return { valid: false, reason: "invalid_signature" };
  }

  return { valid: true };
}
