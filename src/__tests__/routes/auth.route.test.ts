import request from "supertest";
import express from "express";
import { User } from "../../models/user.model";
import { registerUser, loginUser } from "../../controllers/auth.controller";
import signJwt from "../../utils/signJwt";
import bcrypt from "bcrypt";

// Mock bcrypt
jest.mock("bcrypt");
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock signJwt
jest.mock("../../utils/signJwt");
const mockedSignJwt = signJwt as jest.MockedFunction<typeof signJwt>;

// Créer une instance Express séparée pour les tests
const app = express();
app.use(express.json());

// Routes de test
app.post("/auth/register", async (req, res) => {
  try {
    const user = await registerUser(req.body);
    const userToken = mockedSignJwt({
      id: user._id,
      isAdmin: user.isAdmin,
    });

    res.send({
      success: true,
      message: "User registered",
      auth: true,
      token: userToken,
    });
  } catch (error: any) {
    res.status(500).send({
      success: false,
      message: "Error while registering user",
      error: error.message,
    });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const user = await loginUser(req.body.email, req.body.password);
    const userToken = mockedSignJwt({
      id: user._id,
      isAdmin: user.isAdmin,
    });
    res.send({
      success: true,
      message: "User logged in",
      auth: true,
      token: userToken,
    });
  } catch (error: any) {
    res.status(500).send({
      success: false,
      message: "Error while logging in",
      error: error.message,
    });
  }
});

describe("Auth Routes Integration Tests", () => {
  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock bcrypt.hash to return a hashed password
    mockedBcrypt.hash.mockResolvedValue("hashedPassword123" as never);

    // Mock bcrypt.compare to return true for valid passwords
    mockedBcrypt.compare.mockResolvedValue(true as never);

    // Mock signJwt to return a test token
    mockedSignJwt.mockReturnValue("test-jwt-token");
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User registered");
      expect(response.body.auth).toBe(true);
      expect(response.body.token).toBe("test-jwt-token");

      // Verify that signJwt was called
      expect(mockedSignJwt).toHaveBeenCalled();
      const callArgs = mockedSignJwt.mock.calls[0][0];
      expect(callArgs).toHaveProperty("id");
      expect(callArgs).toHaveProperty("isAdmin", false);
    });

    it("should register a user with additional fields", async () => {
      const userData = {
        email: "john@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        age: "30",
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe("test-jwt-token");
    });

    it("should return 500 when registration fails", async () => {
      const userData = {
        email: "test@example.com",
        password: "123", // Too short
      };

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error while registering user");
      expect(response.body.error).toContain(
        "Password must be at least 8 characters long"
      );
    });

    it("should return 500 when user already exists", async () => {
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

      const response = await request(app)
        .post("/auth/register")
        .send(userData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("User already exists");
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const testUser = new User({
        email: "test@example.com",
        password: "hashedPassword123",
        isAdmin: false,
      });
      await testUser.save();
    });

    it("should login user successfully with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User logged in");
      expect(response.body.auth).toBe(true);
      expect(response.body.token).toBe("test-jwt-token");

      // Verify that signJwt was called
      expect(mockedSignJwt).toHaveBeenCalled();
      const callArgs = mockedSignJwt.mock.calls[0][0];
      expect(callArgs).toHaveProperty("id");
      expect(callArgs).toHaveProperty("isAdmin", false);
    });

    it("should return 500 when login fails with invalid credentials", async () => {
      // Mock bcrypt.compare to return false for invalid password
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/auth/login")
        .send(loginData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error while logging in");
      expect(response.body.error).toContain("Invalid password");
    });

    it("should return 500 when user not found", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/auth/login")
        .send(loginData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("User not found");
    });

    it("should return 500 when email is missing", async () => {
      const loginData = {
        password: "password123",
      };

      const response = await request(app)
        .post("/auth/login")
        .send(loginData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Email and password are required");
    });

    it("should return 500 when password is missing", async () => {
      const loginData = {
        email: "test@example.com",
      };

      const response = await request(app)
        .post("/auth/login")
        .send(loginData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Email and password are required");
    });
  });
});
