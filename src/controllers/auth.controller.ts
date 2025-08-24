import { User, IUser } from "../models/user.model";
const bcrypt = require("bcrypt");

async function registerUser(userData: Partial<IUser>): Promise<IUser> {
  try {
    // On ne demande que email et password
    if (!userData.email || !userData.password) {
      throw new Error("Email et mot de passe requis");
    }
    if (typeof userData.email !== "string") {
      throw new Error("Invalid data format: email must be a string");
    }
    if (typeof userData.password !== "string") {
      throw new Error("Invalid data format: password must be a string");
    }
    if (userData.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
    const user = await User.findOne({
      email: userData.email,
    }).exec();
    if (user) {
      throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;
    const newUser = new User(userData);
    const savedUser = await newUser.save();
    return savedUser;
  } catch (error: any) {
    throw new Error(
      "Error while registering user: " + (error as Error).message
    );
  }
}

async function loginUser(email: string, password: string): Promise<IUser> {
  try {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (typeof email !== "string") {
      throw new Error("Invalid data format: email must be a string");
    }
    if (typeof password !== "string") {
      throw new Error("Invalid data format: password must be a string");
    }
    const user = await User.findOne({
      email: email,
    }).exec();
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    return user;
  } catch (error: any) {
    throw new Error("Error while logging in: " + (error as Error).message);
  }
}

export { registerUser, loginUser };
