import jwt from "jsonwebtoken"

export function createToken(tokenPayload, duration, secret) {
    const token = jwt.sign(
        tokenPayload,
        secret,
        { expiresIn: duration }
    );
    return token
}