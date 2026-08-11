import { describe, it, expect } from "vitest";
import { verifyCredentials, createSessionToken, isValidSessionToken } from "./auth";

// auth.ts reads ADMIN_EMAIL/ADMIN_PASSWORD from process.env at module load,
// falling back to these same defaults only when the env vars are unset.
// Hardcoding the fallback literals here would make the suite fail for anyone
// who has ADMIN_EMAIL/ADMIN_PASSWORD set locally (which the README now
// encourages for real deployments), so mirror the same env-var-or-default
// logic instead of assuming the defaults are in effect.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "psicologa@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "senha123";

describe("verifyCredentials", () => {
  it("accepts the configured admin email and password", () => {
    expect(verifyCredentials(ADMIN_EMAIL, ADMIN_PASSWORD)).toBe(true);
  });

  it("rejects a wrong password", () => {
    expect(verifyCredentials(ADMIN_EMAIL, ADMIN_PASSWORD + "x")).toBe(false);
  });

  it("rejects a wrong email", () => {
    expect(verifyCredentials("outro-" + ADMIN_EMAIL, ADMIN_PASSWORD)).toBe(false);
  });
});

describe("session token", () => {
  it("validates a token it created", () => {
    expect(isValidSessionToken(createSessionToken())).toBe(true);
  });

  it("rejects a tampered token", () => {
    expect(isValidSessionToken(createSessionToken() + "x")).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isValidSessionToken(undefined)).toBe(false);
  });

  it("rejects a token with an extra dot-delimited segment", () => {
    expect(isValidSessionToken(createSessionToken() + ".x")).toBe(false);
  });
});
