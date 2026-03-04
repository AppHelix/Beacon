import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock data for testing
const mockEngagement = {
  id: 1,
  name: "Test Project",
  clientName: "Test Client",
  status: "Active",
  description: "Test Description",
  techTags: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("Engagement API", () => {
  describe("GET /api/engagements", () => {
    it("should return a list of engagements on successful call", async () => {
      const mockEngagements = [mockEngagement];

      // Mock fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockEngagements),
        })
      ) as any;

      const response = await fetch("/api/engagements");
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual(mockEngagements);
    });

    it("should return 401 when unauthorized", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: "Unauthorized" }),
        })
      ) as any;

      const response = await fetch("/api/engagements");

      expect(response.status).toBe(401);
      expect(response.ok).toBe(false);
    });
  });

  describe("POST /api/engagements", () => {
    it("should create a new engagement with valid data", async () => {
      const newEngagement = {
        name: "New Project",
        clientName: "New Client",
        status: "Active",
        description: "New Description",
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ ...mockEngagement, ...newEngagement }),
        })
      ) as any;

      const response = await fetch("/api/engagements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEngagement),
      });

      expect(response.status).toBe(201);
      expect(response.ok).toBe(true);
    });

    it("should return 400 when required fields are missing", async () => {
      const invalidData = {
        name: "Test",
        // Missing clientName and status
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () =>
            Promise.resolve({
              error: "Missing required fields: name, clientName, status",
            }),
        })
      ) as any;

      const response = await fetch("/api/engagements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
      expect(response.ok).toBe(false);
    });
  });

  describe("PUT /api/engagements/{id}", () => {
    it("should update an engagement with valid data", async () => {
      const updatedData = {
        status: "Paused",
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ ...mockEngagement, ...updatedData }),
        })
      ) as any;

      const response = await fetch("/api/engagements/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.status).toBe("Paused");
    });

    it("should return 404 when engagement not found", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ error: "Engagement not found" }),
        })
      ) as any;

      const response = await fetch("/api/engagements/999", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Active" }),
      });

      expect(response.status).toBe(404);
      expect(response.ok).toBe(false);
    });
  });

  describe("DELETE /api/engagements/{id}", () => {
    it("should delete an engagement successfully", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      ) as any;

      const response = await fetch("/api/engagements/1", {
        method: "DELETE",
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it("should return 404 when engagement to delete not found", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ error: "Engagement not found" }),
        })
      ) as any;

      const response = await fetch("/api/engagements/999", {
        method: "DELETE",
      });

      expect(response.status).toBe(404);
      expect(response.ok).toBe(false);
    });
  });
});
