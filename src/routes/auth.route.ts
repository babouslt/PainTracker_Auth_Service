import express, { Request, Response } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";
import signJwt from "../utils/signJwt";
const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);
    const userToken = signJwt({
      id: user._id,
      isAdmin: user.isAdmin,
      firstName: user.firstName,
      lastName: user.lastName,
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

router.post("/login", async (req: Request, res: Response) => {
  try {
    const user = await loginUser(req.body.email, req.body.password);
    const userToken = signJwt({
      id: user._id,
      isAdmin: user.isAdmin,
      firstName: user.firstName,
      lastName: user.lastName,
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
export default router;
