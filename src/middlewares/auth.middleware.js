import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"

export const verifyToken = asyncHandler(async (req,res,next)=>{
      

           const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1]
           if(!token){
               throw new ApiError(401,"Unauthorized: No token provided")
            }
           
               const decoded= jwt.verify(token, process.env.ACESS_TOKEN_SECRET)
       
               const user = await User.findById(decoded.userId).select("-password -refreshToken")
       
               if(!user){
                   throw new ApiError(401,"Invalid access token")
               }
               req.user = user
               next()


  
})

