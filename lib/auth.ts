import crypto from "crypto";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "psicologa@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "senha123";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "prototype-secret-troque-em-producao";

export function verifyCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function createSessionToken(): string {
  const payload = `admin:${Date.now()}`;
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  const payloadB64 = Buffer.from(payload).toString("base64url");
  return `${payloadB64}.${signature}`;
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) return false;
  const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return signature === expected;
}
