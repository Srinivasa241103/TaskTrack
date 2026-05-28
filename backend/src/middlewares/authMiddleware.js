import { verifyAccessToken, verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import UserRepository from '../models/userRepo.js';

const userRepo = new UserRepository();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
};

const extractToken = (req) => {
    if (req.cookies?.accessToken) return req.cookies.accessToken;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
    return null;
};

const rotateTokens = async (req, res) => {
    const oldRefreshToken = req.cookies?.refreshToken;
    if (!oldRefreshToken) return null;

    // 1. Verify refresh token signature
    const decoded = verifyRefreshToken(oldRefreshToken);
    if (!decoded) return null;

    // 2. Confirm it still exists in DB (not already rotated or revoked)
    const record = await userRepo.getRefreshTokenRecord(oldRefreshToken);
    if (!record) return null;

    // 3. Build new token pair
    const payload = {
        id: decoded.id,
        role: decoded.role,
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
        generateAccessToken(payload),
        generateRefreshToken(payload),
    ]);

    // 4. Rotate: delete old, store new (atomic-ish — if store fails, we abort)
    await userRepo.deleteRefreshToken(oldRefreshToken);
    const stored = await userRepo.storeRefreshToken(newRefreshToken, decoded.id);
    if (!stored) return null;

    // 5. Set new cookies
    res.cookie('accessToken', newAccessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 1000, // 60 minutes
    });
    res.cookie('refreshToken', newRefreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/v1',
    });

    return payload;
};

const authMiddleware = async (req, res, next) => {
    try {
        const accessToken = extractToken(req);

        if (accessToken) {
            const decoded = verifyAccessToken(accessToken);
            if (decoded) {
                req.user = {
                    userId: decoded.id,
                    role: decoded.role,
                };
                return next();
            }
        }

        // Access token missing or expired — attempt silent rotation
        const rotatedPayload = await rotateTokens(req, res);
        if (rotatedPayload) {
            req.user = {
                userId: rotatedPayload.id,
                role: rotatedPayload.role,
            };
            return next();
        }

        return res.status(401).json({
            success: false,
            message: 'Access denied.',
        });
    } catch {
        return res.status(401).json({
            success: false,
            message: 'Access denied.',
        });
    }
};

export default authMiddleware;
