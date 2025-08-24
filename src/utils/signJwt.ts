import jwt, { Secret } from "jsonwebtoken";

const signJwt = (body: any): string => {
  const secretKey: Secret = process.env.JWT_SECRET as Secret;

  return jwt.sign({ body }, secretKey);
};

export default signJwt;
