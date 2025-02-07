import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve("./node_modules/@workspace/backend-common/.env");
dotenv.config({ path: envPath });

export const JWT_SECRET = process.env.JWT_SECRET;
export const WS_JWT_SECRET = process.env.WS_JWT_SECRET;