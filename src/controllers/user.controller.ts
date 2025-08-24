import { User, IUser } from "../models/user.model";
import mongoose from "mongoose";

async function getAllUsers(): Promise<IUser[]> {
  try {
    const users = await User.find().exec();
    return users;
  } catch (error: any) {
    throw new Error(
      "Error while getting all users: " + (error as Error).message
    );
  }
}

async function getUserById(id: string): Promise<IUser> {
  try {
    const userId = new mongoose.Types.ObjectId(id);

    const user = await User.findById(userId).exec();
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error: any) {
    throw new Error(
      "Error while getting user by id: " + (error as Error).message
    );
  }
}

async function updateUserById(
  id: string,
  userData: Partial<IUser>
): Promise<IUser> {
  try {
    const user = await User.findById(id).exec();
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = await User.findByIdAndUpdate(id, userData, {
      new: true,
    }).exec();
    if (!updatedUser) {
      throw new Error("Error while updating user");
    }
    return updatedUser;
  } catch (error: any) {
    throw new Error(
      "Error while updating user by id: " + (error as Error).message
    );
  }
}

async function deleteUserById(id: string): Promise<IUser> {
  try {
    const user = await User.findById(id).exec();
    if (!user) {
      throw new Error("User not found");
    }
    await User.findByIdAndDelete(id).exec();
    return user;
  } catch (error: any) {
    throw new Error(
      "Error while deleting user by id: " + (error as Error).message
    );
  }
}

export { getAllUsers, getUserById, updateUserById, deleteUserById };
