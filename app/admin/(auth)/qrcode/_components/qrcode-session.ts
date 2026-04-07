export const QR_REFRESH_INTERVAL_SECONDS = 30;
const QR_REFRESH_INTERVAL_MS = QR_REFRESH_INTERVAL_SECONDS * 1000;

export type RegistrationQrSession = {
  token: string;
  issuedAt: Date;
  expiresAt: Date;
  url: string;
};

function getWindowStart(now: Date) {
  return (
    Math.floor(now.getTime() / QR_REFRESH_INTERVAL_MS) *
    QR_REFRESH_INTERVAL_MS
  );
}

export function getSecondsUntilNextRefresh(now: Date) {
  const currentSecond = Math.floor(now.getTime() / 1000);
  const elapsed = currentSecond % QR_REFRESH_INTERVAL_SECONDS;

  return elapsed === 0
    ? QR_REFRESH_INTERVAL_SECONDS
    : QR_REFRESH_INTERVAL_SECONDS - elapsed;
}

export function buildRegistrationQrSession(
  now: Date,
  origin = "https://demo.czedu.local",
): RegistrationQrSession {
  const issuedAt = new Date(getWindowStart(now));
  const expiresAt = new Date(issuedAt.getTime() + QR_REFRESH_INTERVAL_MS);
  const token = `REG-${issuedAt.toISOString().replace(/\D/g, "").slice(0, 14)}`;
  const url = new URL("/application/new", origin);

  url.searchParams.set("from", "admin-qrcode-demo");
  url.searchParams.set("token", token);
  url.searchParams.set("expiresAt", expiresAt.toISOString());

  return {
    token,
    issuedAt,
    expiresAt,
    url: url.toString(),
  };
}
