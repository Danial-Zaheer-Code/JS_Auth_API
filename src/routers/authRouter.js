import express from "express"
import { body } from "express-validator"
import { validateRequest } from "../middleware/requestValidation.js";
import { validateToken, validateRefreshToken } from "../middleware/tokenValidation.js";
import { isAdmin } from "../middleware/adminValidation.js"
import * as authController from "../controllers/authController.js";

export const router = express.Router();

router.post('/register',
    body("email")
        .exists()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email")
        .normalizeEmail(),
    body("name")
        .exists()
        .withMessage("Name is required")
        .notEmpty()
        .withMessage("Name must not be empty")
        .trim()
        .escape(),
    body("password")
        .exists()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 chars long"),
    body("role")
        .optional()
        .isIn(["USER", "ADMIN"])
        .withMessage("Role must be either USER or ADMIN"),
    validateRequest,
    authController.register
)

router.post('/login',
    body("email")
        .exists()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email")
        .trim()
        .normalizeEmail(),
    body("password")
        .exists()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage("Must be at least 8 chars long"),
    validateRequest,
    authController.login
)

router.post("/refresh-token",
    body("token")
        .exists()
        .withMessage("Refresh token is required")
        .notEmpty()
        .withMessage("Refresh token must not be empty"),
    validateRequest,
    validateRefreshToken,
    authController.refresh
)

router.post("/verify-otp",
    body("email")
        .exists()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email")
        .normalizeEmail(),
    body("otp")
        .exists()
        .withMessage("OTP is required")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits long"),
    validateRequest,
    authController.verifyOTP
)
