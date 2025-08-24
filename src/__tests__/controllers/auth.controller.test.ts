import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../../models/user.model";
import { registerUser, loginUser } from "../../controllers/auth.controller";

// Mock bcrypt
jest.mock("bcrypt");
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("Auth Controller Tests", () => {
  let testUserId: string;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock bcrypt.hash to return a hashed password
    mockedBcrypt.hash.mockResolvedValue("hashedPassword123" as never);

    // Mock bcrypt.compare to return true for valid passwords
    mockedBcrypt.compare.mockResolvedValue(true as never);
  });

  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await registerUser(userData);

      expect(result).toBeDefined();
      expect(result.email).toBe("test@example.com");
      expect(result.password).toBe("hashedPassword123");
      expect(mockedBcrypt.hash).toHaveBeenCalledWith("password123", 10);
    });

    it("should register a user with additional fields", async () => {
      const userData = {
        email: "john@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        age: "30",
      };

      const result = await registerUser(userData);

      expect(result).toBeDefined();
      expect(result.email).toBe("john@example.com");
      expect(result.firstName).toBe("John");
      expect(result.lastName).toBe("Doe");
      expect(result.age).toBe("30");
    });

    it("should throw error when email is missing", async () => {
      const userData = {
        password: "password123",
      };

      await expect(registerUser(userData)).rejects.toThrow(
        "Error while registering user: Email et mot de passe requis"
      );
    });

    it("should throw error when password is missing", async () => {
      const userData = {
        email: "test@example.com",
      };

      await expect(registerUser(userData)).rejects.toThrow(
        "Error while registering user: Email et mot de passe requis"
      );
    });

    it("should throw error when email is not a string", async () => {
      const userData = {
        email: 123 as any,
        password: "password123",
      };

      await expect(registerUser(userData)).rejects.toThrow(
        "Error while registering user: Invalid data format: email must be a string"
      );
    });

    it("should throw error when password is not a string", async () => {
      const userData = {
        email: "test@example.com",
        password: 123 as any,
      };

      await expect(registerUser(userData)).rejects.toThrow(
        "Error while registering user: Invalid data format: password must be a string"
      );
    });

    it("should throw error when password is too short", async () => {
      const userData = {
        email: "test@example.com",
        password: "123",
      };

      await expect(registerUser(userData)).rejects.toThrow(
        "Error while registering user: Password must be at least 8 characters long"
      );
    });

    it("should throw error when user already exists", async () => {
      // Create a user first
      const existingUser = new User({
        email: "existing@example.com",
        password: "hashedPassword123",
      });
      await existingUser.save();

      const userData = {
        email: "existing@example.com",
        password: "password123",
      };

      await expect(registerUser(userData)).rejects.toThrow(
        "Error while registering user: User already exists"
      );
    });

    it("should hash password before saving", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      await registerUser(userData);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith("password123", 10);
    });
  });

  describe("loginUser", () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const testUser = new User({
        email: "test@example.com",
        password: "hashedPassword123",
      });
      const savedUser = await testUser.save();
      testUserId = savedUser._id.toString();
    });

    it("should login user successfully with valid credentials", async () => {
      const result = await loginUser("test@example.com", "password123");

      expect(result).toBeDefined();
      expect(result.email).toBe("test@example.com");
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword123"
      );
    });

    it("should throw error when email is missing", async () => {
      await expect(loginUser("", "password123")).rejects.toThrow(
        "Error while logging in: Email and password are required"
      );
    });

    it("should throw error when password is missing", async () => {
      await expect(loginUser("test@example.com", "")).rejects.toThrow(
        "Error while logging in: Email and password are required"
      );
    });

    it("should throw error when email is not a string", async () => {
      await expect(loginUser(123 as any, "password123")).rejects.toThrow(
        "Error while logging in: Invalid data format: email must be a string"
      );
    });

    it("should throw error when password is not a string", async () => {
      await expect(loginUser("test@example.com", 123 as any)).rejects.toThrow(
        "Error while logging in: Invalid data format: password must be a string"
      );
    });

    it("should throw error when user not found", async () => {
      await expect(
        loginUser("nonexistent@example.com", "password123")
      ).rejects.toThrow("Error while logging in: User not found");
    });

    it("should throw error when password is invalid", async () => {
      // Mock bcrypt.compare to return false for invalid password
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        loginUser("test@example.com", "wrongpassword")
      ).rejects.toThrow("Error while logging in: Invalid password");
    });

    it("should call bcrypt.compare with correct parameters", async () => {
      await loginUser("test@example.com", "password123");

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword123"
      );
    });
  });
});
