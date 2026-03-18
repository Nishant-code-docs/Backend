
import express from "express";
import cookieParser   from "cookie-parser";
import cors from 'cors'
import authRoutes from "./routes/auth.routes.js"


const app = express();

app.use(cors({
    origin: process.env.ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"}))
app.use(express.static('public'))
app.use(cookieParser())

app.use("/api/v1/user",authRoutes);



export default app;