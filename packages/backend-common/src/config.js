"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS_JWT_SECRET = exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.resolve("./node_modules/@workspace/backend-common/.env");
dotenv_1.default.config({ path: envPath });
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.WS_JWT_SECRET = process.env.WS_JWT_SECRET;
