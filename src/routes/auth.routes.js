import express from "express"
import { registerController, updateAvatar, updateCoverImage, updateUserDetails } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyToken } from "../middlewares/auth.middleware.js"
import { loginController, logoutController,refreshTokenController,changePasswordController } from "../controllers/user.controller.js"

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

// This is my refresh token route
router.post("/refresh-token",refreshTokenController)

// change Password
router.post("/change-password",verifyToken,changePasswordController)

// Update user details
router.post("/update-user",verifyToken,updateUserDetails)

// Update Avatar
router.post("/update-avatar",upload.single('avatar'),verifyToken,updateAvatar)

// Update CoverImage
router.post("/update-coverImage",upload.single('coverImage'),verifyToken,updateCoverImage)

export default router