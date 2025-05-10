"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient();
if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = exports.prisma;
}
exports.default = exports.prisma;
