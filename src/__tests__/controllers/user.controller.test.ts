import mongoose from "mongoose";
import { User } from "../../models/user.model";
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from "../../controllers/user.controller";

describe("User Controller Tests", () => {
  let testUserId: string;

  beforeEach(async () => {
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

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      // Create additional users
      const user2 = new User({
        email: "test2@example.com",
        password: "password123",
        isAdmin: false,
        isPremium: false,
        aiUsageCount: 3,
      });
      await user2.save();

      const users = await getAllUsers();
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBeGreaterThanOrEqual(2);
      expect(users[0]).toHaveProperty("email");
      expect(users[0]).toHaveProperty("isAdmin");
      expect(users[0]).toHaveProperty("isPremium");
    });

    it("should return empty array when no users exist", async () => {
      // Clear all users
      await User.deleteMany({});

      const users = await getAllUsers();
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBe(0);
    });
  });

  describe("getUserById", () => {
    it("should return user by valid ID", async () => {
      const user = await getUserById(testUserId);
      expect(user).toBeDefined();
      expect(user._id.toString()).toBe(testUserId);
      expect(user.email).toBe("test@example.com");
    });

    it("should throw error for invalid ID format", async () => {
      await expect(getUserById("invalid-id")).rejects.toThrow(
        "Error while getting user by id"
      );
    });

    it("should throw error for non-existent ID", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await expect(getUserById(nonExistentId)).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("updateUserById", () => {
    it("should update user successfully", async () => {
      const updateData = {
        firstName: "Updated",
        lastName: "Name",
        age: "30",
      };

      const updatedUser = await updateUserById(testUserId, updateData);
      expect(updatedUser).toBeDefined();
      expect(updatedUser.firstName).toBe("Updated");
      expect(updatedUser.lastName).toBe("Name");
      expect(updatedUser.age).toBe("30");
    });

    it("should update premium status", async () => {
      const updateData = {
        isPremium: true,
        aiUsageCount: 10,
      };

      const updatedUser = await updateUserById(testUserId, updateData);
      expect(updatedUser.isPremium).toBe(true);
      expect(updatedUser.aiUsageCount).toBe(10);
    });

    it("should throw error for non-existent user", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await expect(
        updateUserById(nonExistentId, { firstName: "Test" })
      ).rejects.toThrow("User not found");
    });

    it("should handle empty update data", async () => {
      const originalUser = await getUserById(testUserId);
      const updatedUser = await updateUserById(testUserId, {});
      expect(updatedUser._id.toString()).toBe(testUserId);
      expect(updatedUser.email).toBe(originalUser.email);
    });
  });

  describe("deleteUserById", () => {
    it("should delete user successfully", async () => {
      const userToDelete = await getUserById(testUserId);
      expect(userToDelete).toBeDefined();

      const deletedUser = await deleteUserById(testUserId);
      expect(deletedUser._id.toString()).toBe(testUserId);

      // Verify user is deleted
      await expect(getUserById(testUserId)).rejects.toThrow("User not found");
    });

    it("should throw error for non-existent user", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await expect(deleteUserById(nonExistentId)).rejects.toThrow(
        "User not found"
      );
    });
  });
});
