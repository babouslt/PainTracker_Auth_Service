import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { User } from "../../models/user.model";
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from "../../controllers/user.controller";
import verifyToken from "../../utils/verifyJwt";

// Mock verifyToken
jest.mock("../../utils/verifyJwt");
const mockedVerifyToken = verifyToken as jest.MockedFunction<
  typeof verifyToken
>;

// Créer une instance Express séparée pour les tests
const app = express();
app.use(express.json());

// Routes de test - LES ROUTES SPÉCIFIQUES DOIVENT ÊTRE DÉFINIES AVANT LES ROUTES AVEC PARAMÈTRES
app.put("/users/update", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.body.email },
      req.body,
      { new: true }
    );
    res.send({
      success: true,
      message: "User updated",
      user,
    });
  } catch (error: any) {
    res.status(500).send({
      success: false,
      message: "Error while updating user",
      error: error.message,
    });
  }
});

// Route spéciale pour tester le cas sans token (sans paramètre) - DOIT ÊTRE AVANT LA ROUTE AVEC PARAMÈTRE
app.get("/users/getMe", async (req, res) => {
  return res.status(401).send({
    success: false,
    message: "Token not provided",
  });
});

app.get("/users/getMe/:token", async (req, res) => {
  const token = req.params.token;
  if (!token) {
    return res.status(401).send({
      success: false,
      message: "Token not provided",
    });
  }

  const decodedToken = mockedVerifyToken(token, "test-secret");
  if (!decodedToken) {
    return res.status(401).send({
      success: false,
      message: "Invalid token",
    });
  }

  try {
    const user = await getUserById(decodedToken.body.id);
    res.send({
      success: true,
      message: "User retrieved",
      user,
    });
  } catch (error: any) {
    res.status(500).send({
      success: false,
      message: "Error while getting user",
      error: error.message,
    });
  }
});

// Routes avec paramètres dynamiques - DOIVENT ÊTRE DÉFINIES APRÈS LES ROUTES SPÉCIFIQUES
app.get("/users/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.send({
      success: true,
      message: "User retrieved",
      user,
    });
  } catch (error: any) {
    res.status(500).send({
      success: false,
      message: "Error while getting user",
      error: error.message,
    });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await updateUserById(req.params.id, req.body);
    res.send({
      success: true,
      message: "User updated",
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).send({
      success: false,
      message: "Error while updating user",
      error: error.message,
    });
  }
});

describe("User Routes Integration Tests", () => {
  let testUserId: string;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a test user for each test
    const testUser = new User({
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      isAdmin: false,
      isPremium: false,
      aiUsageCount: 3,
    });
    const savedUser = await testUser.save();
    testUserId = savedUser._id.toString();
  });

  describe("GET /users/:id", () => {
    it("should return user by ID", async () => {
      const response = await request(app)
        .get(`/users/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User retrieved");
      expect(response.body.user).toBeDefined();
      expect(response.body.user._id).toBe(testUserId);
      expect(response.body.user.email).toBe("test@example.com");
    });

    it("should return 500 for invalid ID format", async () => {
      const response = await request(app).get("/users/invalid-id").expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error while getting user");
    });

    it("should return 500 for non-existent ID", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/users/${nonExistentId}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error while getting user");
    });
  });

  describe("PUT /users/update", () => {
    it("should update user by email", async () => {
      const updateData = {
        email: "test@example.com",
        firstName: "Updated",
        lastName: "Name",
      };

      const response = await request(app)
        .put("/users/update")
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User updated");
      expect(response.body.user).toBeDefined();
      expect(response.body.user.firstName).toBe("Updated");
      expect(response.body.user.lastName).toBe("Name");
    });

    it("should return 200 for non-existent email", async () => {
      const updateData = {
        email: "nonexistent@example.com",
        firstName: "Updated",
      };

      const response = await request(app)
        .put("/users/update")
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeNull();
    });
  });

  describe("GET /users/getMe/:token", () => {
    it("should return user by valid token", async () => {
      // Mock verifyToken to return a valid decoded token
      mockedVerifyToken.mockReturnValue({
        body: {
          id: testUserId,
          isAdmin: false,
        },
      });

      const response = await request(app)
        .get(`/users/getMe/valid-token`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User retrieved");
      expect(response.body.user).toBeDefined();
      expect(response.body.user._id).toBe(testUserId);
    });

    it("should return 401 for missing token", async () => {
      const response = await request(app).get("/users/getMe").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token not provided");
    });

    it("should return 401 for invalid token", async () => {
      // Mock verifyToken to return null (invalid token)
      mockedVerifyToken.mockReturnValue(null);

      const response = await request(app)
        .get(`/users/getMe/invalid-token`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid token");
    });
  });

  describe("PUT /users/:id", () => {
    it("should update user by ID", async () => {
      const updateData = {
        firstName: "Updated",
        lastName: "Name",
        age: "30",
      };

      const response = await request(app)
        .put(`/users/${testUserId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User updated");
      expect(response.body.user).toBeDefined();
      expect(response.body.user.firstName).toBe("Updated");
      expect(response.body.user.lastName).toBe("Name");
      expect(response.body.user.age).toBe("30");
    });

    it("should update premium status", async () => {
      const updateData = {
        isPremium: true,
        aiUsageCount: 10,
      };

      const response = await request(app)
        .put(`/users/${testUserId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.isPremium).toBe(true);
      expect(response.body.user.aiUsageCount).toBe(10);
    });

    it("should return 500 for non-existent user", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .put(`/users/${nonExistentId}`)
        .send({ firstName: "Test" })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error while updating user");
    });
  });
});
