import { Request, Response, NextFunction } from "express";
import { body, validationResult, ValidationChain } from "express-validator";

export const checkEmail: ValidationChain[] = [
  body("email").isEmail().withMessage("Email format not valid"),
];

export const checkIdentity: ValidationChain[] = [
  body("firstName")
    .isAlphanumeric()
    .withMessage("FirstName format is not valid"),
  body("lastName").isAlphanumeric().withMessage("lastName format is not valid"),
];

export const checkPassword: ValidationChain[] = [
  body("password")
    .notEmpty()
    .isLength({ min: 5, max: 30 })
    .matches(/^[A-Za-z0-9 .,'!&(§è!çà)]+$/)
    .withMessage("Password not valid"),
];

export const validation = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response<any, Record<string, any>> => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      status: 400,
      stack: process.env.NODE_ENV,
      errors: errors.array(),
    });
  }

  next();
};
