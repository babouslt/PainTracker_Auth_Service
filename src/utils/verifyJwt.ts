import { verify } from "jsonwebtoken";

interface DecodedToken {
  body: {
    id: string;
    isAdmin: boolean;
  };
}

function verifyToken(token: string, secretKey: string): DecodedToken | null {
  try {
    const decodedToken = verify(token, secretKey);
    return decodedToken as DecodedToken;
  } catch (error) {
    return null;
  }
}

export default verifyToken;
