import dotenv from "dotenv"
dotenv.config();

import express from "express"
import multer from "multer"
import {router as authRouter} from "./src/routers/authRouter.js"

const app = express();
const upload = multer();

app.disable('x-powered-by');
app.use(upload.none());
app.use("/api/users", authRouter)
app.listen(process.env.PORT, () => {
	console.log(`Example app listening on port ${process.env.PORT}`)
})