import { describe, it, expect } from "vitest";
import { verifyCredentials, createSessionToken, isValidSessionToken } from "./auth";

describe("verifyCredentials", () => {
  it("accepts the configured admin email and password", () => {
    expect(verifyCredentials("psicologa@example.com", "senha123")).toBe(true);
  });

  it("rejects a wrong password", () => {
    expect(verifyCredentials("psicologa@example.com", "errada")).toBe(false);
  });

  it("rejects a wrong email", () => {
    expect(verifyCredentials("outro@example.com", "senha123")).toBe(false);
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
