import { failure } from "../utils/result.js";
import * as statusCode from "../utils/statusCodes.js"
export async function isAdmin(req, res, next){
    if(!req.isAdmin){
        const result = failure(statusCode.FORBIDDEN, "Only admins are allowed");
        return res.status(result.status).json(result.responseBody)
    }

    next()
}