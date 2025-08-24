import mongoose from "mongoose";
import { User, Gender, IUser } from "../../models/user.model";

describe("User Model Tests", () => {
  describe("Schema Validation", () => {
    it("should create a user with required fields", async () => {
      const validUser = new User({
        email: "test@example.com",
        password: "password123",
      });

      const savedUser = await validUser.save();
      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe("test@example.com");
      expect(savedUser.password).toBe("password123");
      expect(savedUser.isAdmin).toBe(false);
      expect(savedUser.isPremium).toBe(false);
      expect(savedUser.aiUsageCount).toBe(3);
    });

    it("should create a user with all fields", async () => {
      const completeUser = new User({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
        phoneNumber: "+1234567890",
        gender: Gender.Male,
        photo: "https://example.com/photo.jpg",
        height: "180cm",
        weight: "75kg",
        age: "30",
        isAdmin: true,
        isPremium: true,
        aiUsageCount: 10,
        stripeSubscriptionId: "sub_123",
      });

      const savedUser = await completeUser.save();
      expect(savedUser.firstName).toBe("John");
      expect(savedUser.lastName).toBe("Doe");
      expect(savedUser.email).toBe("john@example.com");
      expect(savedUser.phoneNumber).toBe("+1234567890");
      expect(savedUser.gender).toBe(Gender.Male);
      expect(savedUser.photo).toBe("https://example.com/photo.jpg");
      expect(savedUser.height).toBe("180cm");
      expect(savedUser.weight).toBe("75kg");
      expect(savedUser.age).toBe("30");
      expect(savedUser.isAdmin).toBe(true);
      expect(savedUser.isPremium).toBe(true);
      expect(savedUser.aiUsageCount).toBe(10);
      expect(savedUser.stripeSubscriptionId).toBe("sub_123");
    });

    it("should fail to create user without email", async () => {
      const userWithoutEmail = new User({
        password: "password123",
      });

      let err: any;
      try {
        await userWithoutEmail.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.email).toBeDefined();
    });

    it("should fail to create user without password", async () => {
      const userWithoutPassword = new User({
        email: "test@example.com",
      });

      let err: any;
      try {
        await userWithoutPassword.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.password).toBeDefined();
    });

    it("should fail to create user with invalid gender", async () => {
      const userWithInvalidGender = new User({
        email: "test@example.com",
        password: "password123",
        gender: "invalid-gender" as any,
      });

      let err: any;
      try {
        await userWithInvalidGender.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.gender).toBeDefined();
    });

    it("should set default values correctly", async () => {
      const userWithDefaults = new User({
        email: "test@example.com",
        password: "password123",
      });

      const savedUser = await userWithDefaults.save();
      expect(savedUser.isAdmin).toBe(false);
      expect(savedUser.isPremium).toBe(false);
      expect(savedUser.aiUsageCount).toBe(3);
      expect(savedUser.photo).toBe(
        "https://c8.alamy.com/compfr/r6er5k/voir-le-profil-de-jeunes-beau-persian-woman-thinking-r6er5k.jpg"
      );
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    it("should enforce unique email constraint", async () => {
      const user1 = new User({
        email: "duplicate@example.com",
        password: "password123",
      });
      await user1.save();

      const user2 = new User({
        email: "duplicate@example.com",
        password: "password456",
      });

      let err: any;
      try {
        await user2.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeDefined();
      expect(err.code).toBe(11000); // MongoDB duplicate key error
    });
  });

  describe("Gender Enum", () => {
    it("should accept valid gender values", async () => {
      const maleUser = new User({
        email: "male@example.com",
        password: "password123",
        gender: Gender.Male,
      });
      await expect(maleUser.save()).resolves.toBeDefined();

      const femaleUser = new User({
        email: "female@example.com",
        password: "password123",
        gender: Gender.Female,
      });
      await expect(femaleUser.save()).resolves.toBeDefined();

      const otherUser = new User({
        email: "other@example.com",
        password: "password123",
        gender: Gender.Other,
      });
      await expect(otherUser.save()).resolves.toBeDefined();
    });
  });

  describe("Timestamps", () => {
    it("should automatically set createdAt and updatedAt", async () => {
      const user = new User({
        email: "timestamp@example.com",
        password: "password123",
      });

      const savedUser = await user.save();
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);

      // Update the user with a longer delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 100));
      savedUser.firstName = "Updated";
      const updatedUser = await savedUser.save();

      // Verify that updatedAt is greater than or equal to createdAt
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(
        updatedUser.createdAt.getTime()
      );
    });
  });
});
