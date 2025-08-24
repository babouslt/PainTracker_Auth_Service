import jwt from "jsonwebtoken";
import signJwt from "../../utils/signJwt";

// Mock process.env
const originalEnv = process.env;

describe("JWT Signing Tests", () => {
  beforeEach(() => {
    // Set up test environment
    process.env = { ...originalEnv, JWT_SECRET: "test-secret-key" };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("Valid Token Signing", () => {
    it("should sign a token with user body", async () => {
      const userBody = {
        id: "test-user-id",
        isAdmin: false,
      };

      const token = signJwt(userBody);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      // Verify the token can be decoded
      const decoded = jwt.verify(token, "test-secret-key") as any;
      expect(decoded.body).toEqual(userBody);
    });

    it("should sign a token with admin user body", async () => {
      const adminBody = {
        id: "admin-user-id",
        isAdmin: true,
      };

      const token = signJwt(adminBody);
      expect(token).toBeDefined();

      const decoded = jwt.verify(token, "test-secret-key") as any;
      expect(decoded.body).toEqual(adminBody);
    });

    it("should sign a token with complex body", async () => {
      const complexBody = {
        id: "user-123",
        isAdmin: false,
        email: "user@example.com",
        role: "user",
      };

      const token = signJwt(complexBody);
      expect(token).toBeDefined();

      const decoded = jwt.verify(token, "test-secret-key") as any;
      expect(decoded.body).toEqual(complexBody);
    });
  });

  describe("Environment Variable Handling", () => {
    it("should use JWT_SECRET from environment", async () => {
      const userBody = { id: "test", isAdmin: false };
      const token = signJwt(userBody);

      // Should work with the test secret
      expect(() => jwt.verify(token, "test-secret-key")).not.toThrow();

      // Should fail with wrong secret
      expect(() => jwt.verify(token, "wrong-secret")).toThrow();
    });

    it("should handle missing JWT_SECRET", async () => {
      delete process.env.JWT_SECRET;

      const userBody = { id: "test", isAdmin: false };
      expect(() => signJwt(userBody)).toThrow();
    });

    it("should handle empty JWT_SECRET", async () => {
      process.env.JWT_SECRET = "";

      const userBody = { id: "test", isAdmin: false };
      expect(() => signJwt(userBody)).toThrow();
    });
  });

  describe("Token Structure", () => {
    it("should create token with correct structure", async () => {
      const userBody = { id: "test", isAdmin: false };
      const token = signJwt(userBody);

      const decoded = jwt.verify(token, "test-secret-key") as any;
      expect(decoded).toHaveProperty("body");
      expect(decoded.body).toEqual(userBody);
      expect(decoded).toHaveProperty("iat"); // issued at
      // Note: exp property is only present if expiration is set in signJwt
    });

    it("should preserve all properties in body", async () => {
      const userBody = {
        id: "test-user",
        isAdmin: false,
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      };

      const token = signJwt(userBody);
      const decoded = jwt.verify(token, "test-secret-key") as any;

      expect(decoded.body.id).toBe("test-user");
      expect(decoded.body.isAdmin).toBe(false);
      expect(decoded.body.email).toBe("test@example.com");
      expect(decoded.body.firstName).toBe("Test");
      expect(decoded.body.lastName).toBe("User");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty body", async () => {
      const emptyBody = {};
      const token = signJwt(emptyBody);

      expect(token).toBeDefined();
      const decoded = jwt.verify(token, "test-secret-key") as any;
      expect(decoded.body).toEqual({});
    });

    it("should handle null body", async () => {
      const nullBody = null as any;
      const token = signJwt(nullBody);

      expect(token).toBeDefined();
      const decoded = jwt.verify(token, "test-secret-key") as any;
      expect(decoded.body).toBeNull();
    });

    it("should handle undefined body", async () => {
      const undefinedBody = undefined as any;
      const token = signJwt(undefinedBody);

      expect(token).toBeDefined();
      const decoded = jwt.verify(token, "test-secret-key") as any;
      expect(decoded.body).toBeUndefined();
    });
  });
});
