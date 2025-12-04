import { registerAs } from "@nestjs/config";

export default registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET || 'super-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || 604800,
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || 2592000,
}));