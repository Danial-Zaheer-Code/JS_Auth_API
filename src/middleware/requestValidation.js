import { validationResult } from "express-validator";
import { failure } from "../utils/result.js";
import * as stausCode from "../utils/statusCodes.js"

export async function validateRequest(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = {};

        for (const error of errors.array()) {
            if (!formattedErrors[error.path]) {
                formattedErrors[error.path] = [];
            }

            formattedErrors[error.path].push(error.msg);
        }

        const result = failure(
            stausCode.BAD_REQUEST,
            "Wrong Input",
            formattedErrors
        );

        return res.status(result.status).json(result.responseBody);
    }

    next();
}