import express from "express"
import { registerController } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyToken } from "../middlewares/auth.middleware.js"
import { loginController, logoutController } from "../controllers/user.controller.js"

const router=express.Router()

// This is my register route 
router.post("/register",
    upload.fields([
     {
        name:"avatar",
        maxCount:1,
     } ,
     {
        name:"coverImage",
        maxCount:1
     } 
]),(registerController))

// This is my login Route 
router.post("/login",loginController)

// This is my logout Route 
router.post("/logout",verifyToken,logoutController)

export default router