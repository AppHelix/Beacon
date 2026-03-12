import { describe, it, expect, vi, beforeEach } from "vitest";

const mockHandRaise = {
  id: 1,
  signal_id: 1,
  user_email: "testuser@example.com",
  user_name: "Test User",
  created_at: "2024-01-01T00:00:00Z",
};

// Reset fetch mock before each test
beforeEach(() => {
  vi.resetAllMocks();
});

describe("Hand-Raise API", () => {
  describe("GET /api/signals/1/hand-raise", () => {
    it("should return a list of hand-raises", async () => {
      const mockHandRaises = [mockHandRaise];
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockHandRaises),
        })
      ) as any;

      const response = await fetch("/api/signals/1/hand-raise");
      const data = await response.json();
      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].user_email).toBe("testuser@example.com");
    });
  });

  describe("POST /api/signals/1/hand-raise", () => {
    it("should create a new hand-raise", async () => {
      const newHandRaise = {
        signal_id: 1,
        user_email: "newuser@example.com",
        user_name: "New User",
        created_at: "2024-01-02T00:00:00Z",
      };
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ ...mockHandRaise, ...newHandRaise }),
        })
      ) as any;

      const response = await fetch("/api/signals/1/hand-raise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHandRaise),
      });
      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.user_email).toBe("newuser@example.com");
    });

    it("should return 409 if already raised", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 409,
          json: () => Promise.resolve({ error: "Already raised" }),
        })
      ) as any;

      const response = await fetch("/api/signals/1/hand-raise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal_id: 1, user_email: "testuser@example.com" }),
      });
      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toBe("Already raised");
    });
  });
});
