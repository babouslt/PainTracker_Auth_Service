import jwt from "jsonwebtoken";
import verifyToken from "../../utils/verifyJwt";

describe("JWT Verification Tests", () => {
  const secretKey = "test-secret-key";

  describe("Valid Token Verification", () => {
    it("should verify a valid token", () => {
      const payload = {
        body: {
          id: "test-user-id",
          isAdmin: false,
        },
      };
      const token = jwt.sign(payload, secretKey);

      const result = verifyToken(token, secretKey);
      expect(result).toBeDefined();
      expect(result.body.id).toBe("test-user-id");
      expect(result.body.isAdmin).toBe(false);
    });

    it("should verify token with admin payload", () => {
      const payload = {
        body: {
          id: "test-user-id",
          isAdmin: true,
        },
      };
      const token = jwt.sign(payload, secretKey);

      const result = verifyToken(token, secretKey);
      expect(result).toBeDefined();
      expect(result.body.id).toBe("test-user-id");
      expect(result.body.isAdmin).toBe(true);
    });
  });

  describe("Invalid Token Verification", () => {
    it("should return null for invalid token", () => {
      const invalidToken = "invalid-token";
      const result = verifyToken(invalidToken, secretKey);
      expect(result).toBeNull();
    });

    it("should return null for token with wrong secret", () => {
      const payload = { id: "test-user-id" };
      const token = jwt.sign(payload, "wrong-secret");

      const result = verifyToken(token, secretKey);
      expect(result).toBeNull();
    });

    it("should return null for expired token", () => {
      const payload = { id: "test-user-id" };
      const token = jwt.sign(payload, secretKey, { expiresIn: "1ms" });

      // Wait for token to expire
      setTimeout(() => {
        const result = verifyToken(token, secretKey);
        expect(result).toBeNull();
      }, 10);
    });

    it("should return null for malformed token", () => {
      const malformedToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature";
      const result = verifyToken(malformedToken, secretKey);
      expect(result).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty token", () => {
      const result = verifyToken("", secretKey);
      expect(result).toBeNull();
    });

    it("should handle null token", () => {
      const result = verifyToken(null as any, secretKey);
      expect(result).toBeNull();
    });

    it("should handle undefined token", () => {
      const result = verifyToken(undefined as any, secretKey);
      expect(result).toBeNull();
    });

    it("should handle empty secret", () => {
      const payload = { id: "test-user-id" };
      const token = jwt.sign(payload, secretKey);

      const result = verifyToken(token, "");
      expect(result).toBeNull();
    });
  });

  describe("Token Payload Structure", () => {
    it("should handle token with minimal body structure", () => {
      const payload = {
        body: {
          id: "test-user-id",
          isAdmin: false,
        },
      };
      const token = jwt.sign(payload, secretKey);

      const result = verifyToken(token, secretKey);
      expect(result).toBeDefined();
      expect(result.body.id).toBe("test-user-id");
      expect(result.body.isAdmin).toBe(false);
    });

    it("should handle token with only required fields", () => {
      const payload = {
        body: {
          id: "admin-user-id",
          isAdmin: true,
        },
      };
      const token = jwt.sign(payload, secretKey);

      const result = verifyToken(token, secretKey);
      expect(result).toBeDefined();
      expect(result.body.id).toBe("admin-user-id");
      expect(result.body.isAdmin).toBe(true);
    });
  });
});
