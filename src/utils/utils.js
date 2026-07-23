import jwt from "jsonwebtoken"
import crypto from "crypto"
export function createToken(tokenPayload, duration, secret) {
    const token = jwt.sign(
        tokenPayload,
        secret,
        { expiresIn: duration }
    );
    return token
}

export function generateOTP() {
    return crypto.randomInt(100000, 1000000).toString();
}