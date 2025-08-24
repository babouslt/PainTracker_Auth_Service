import express, { Request, Response } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from "../controllers/user.controller";
import verifyToken from "../utils/verifyJwt";
import { IUser, User } from "../models/user.model";
const router = express.Router();

router.get("/:id", async (req: Request, res: Response) => {
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

router.put("/update", async (req: Request, res: Response) => {
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

router.get("/getMe/:token", async (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token) {
    return res.status(401).send({
      success: false,
      message: "Token not provided",
    });
  }

  const decodedToken = verifyToken(token, process.env.JWT_SECRET as string);
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

router.put("/:id", async (req: Request, res: Response) => {
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

export default router;
