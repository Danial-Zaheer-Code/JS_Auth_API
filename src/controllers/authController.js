import * as authServices from "../services/authServices.js"
import * as emailServices from "../services/emailServices.js"
import * as statusCodes from "../utils/statusCodes.js"
import { generateOTP } from "../utils/utils.js"
export async function register(req, res) {
    const user = req.body
    user.otp = generateOTP()
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    const result = await authServices.register(user);

    if (result.status === 201) {
        const emailResult = await emailServices.sendOtp(user.email, user.otp);

        return res.status(emailResult.status).json(emailResult.responseBody);
    }

    return res.status(result.status).json(result.responseBody)
}

export async function login(req, res) {
    const user = req.body

    const result = await authServices.login(user)

    return res.status(result.status).json(result.responseBody)
}

export async function refresh(req, res) {
    const tokenPayload = {
        userId: req.userId,
        isAdmin: req.isAdmin
    }

    const result = await authServices.refreshToken(tokenPayload)

    return res.status(result.status).json(result.responseBody)
}

export async function verifyOTP(req, res) {
    const { email, otp } = req.body
    const result = await authServices.verifyOTP(email, otp)
    return res.status(result.status).json(result.responseBody)
}