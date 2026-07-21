import * as authServices from "../services/authServices.js"
export async function register(req, res) {
    const user = req.body

    const result = await authServices.register(user);

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
