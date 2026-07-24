import nodemailer from "nodemailer"
import {success, failure} from "../utils/result.js"
import * as statusCodes from "../utils/statusCodes.js"
export async function sendOtp(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: 'Your App <noreply@yourapp.com>',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is ${otp}. It will expire in 10 minutes.`
        };

        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return failure(statusCodes.INTERNAL_SERVER_ERROR, "Failed to send OTP");
            }

            //Display the preview URL for testing purposes
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
        return success(statusCodes.OK, "OTP sent successfully");
    } catch (error) {
        console.error("Error sending OTP:", error);
        return failure(statusCodes.INTERNAL_SERVER_ERROR, "Failed to send OTP");
    }
};