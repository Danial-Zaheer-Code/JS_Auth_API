import dotenv from "dotenv"
dotenv.config()

import * as stausCode from "../utils/statusCodes.js"
import { prisma } from "../lib/prisma.js"
import { hash, compare } from "../utils/hashing.js"
import { success, failure } from "../utils/result.js"
import { createToken } from "../utils/utils.js"

export async function register(user) {
    try {
        if (await isEmailTaken(user.email)) {
            return failure(stausCode.CONFLICT, "User already exists")
        }

        user.password = await hash(user.password);
        await prisma.user.create({
            data: user
        })

        return success(stausCode.CREATED, "Registration Successfull. OTP sent to your email");
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong. Try again later")
    }
}

export async function login(user) {
    try {
        const existingUser = await retrieveUser(user.email);
        if (!existingUser) {
            return failure(stausCode.NOT_FOUND, "User does not exists")
        }

        const isMatch = await compare(user.password, existingUser.password);

        if (!isMatch) {
            return failure(stausCode.UNAUTHORIZED, "Wrong Password")
        }

        const tokenPayload = {
            userId: existingUser.id,
            isAdmin: existingUser.role == "ADMIN"
        }

        const token = createToken(tokenPayload, "15m", process.env.JWT_SECRET)
        const refreshToken = createToken(tokenPayload, "1h", process.env.REFRESH_JWT_SECRET)

        return success(stausCode.OK, "Login Successfull", { token: token, refreshToken: refreshToken, userName: existingUser.name });

    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong try again later")
    }
}

async function isEmailTaken(email) {
    const user = await retrieveUser(email)

    return user != null;
}

async function retrieveUser(email) {
    return await prisma.user.findFirst({
        where: {
            email: email
        },
        select: {
            id: true,
            name: true,
            password: true,
            role: true
        }
    })
}

export async function refreshToken(tokenPayload) {
    try {
        const token = createToken(tokenPayload, "15m", process.env.JWT_SECRET)
        return success(stausCode.OK, "Token refreshed successfully", { token: token })
    } catch (error) {
        console.log(error)
        return failure(stausCode.INTERNAL_SERVER_ERROR, "Something went wrong try again later")
    }
}

