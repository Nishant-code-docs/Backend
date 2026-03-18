import {User} from "../models/user.models.js"
import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {uploadOncloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerController = asyncHandler(async(req,res,next)=>{

    
    // get user details from frontend
    const {username , fullname , email, password}=req.body
    
    // validation - not empty
    if(
        [username,fullname,email,password].some((fields)=>{
              fields.trim()==""
        })
    ){
        throw new ApiError(400," All fields are required");
    }


  // check if user already exists: username, email
     const existedUser = await User.findOne({
        $or:[{username},{email}]
     })

       
     if(existedUser){
        throw new ApiError(409 ,"User with email or username already exists")
     }
  
        // console.log("files:", req.files);
      // check for images, check for avatar
     const avtarLocalFilePath  = req.files?.avatar[0]?.path;
     const coverImageLocalPath= req.files?.coverImage?.[0]?.path;

     if(!avtarLocalFilePath){
        throw new ApiError(400,"Avtar file is required")
     }


    //    upload them to cloudinary, avatar
    const avatar = await uploadOncloudinary(avtarLocalFilePath)
    const coverImage= await uploadOncloudinary(coverImageLocalPath)

    console.log(avatar);
    console.log(coverImage);
    
    
    if(!avatar){
        throw new ApiError(400,"Avtar field is required")
    }


    // create user object - create entry in db
    const user = await User.create({

        fullname:fullname,
        username:username.toLowerCase(),
        email:email,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        password:password,
        
    })

    // remove password and refresh token field from response
   const createdUser= await User.findById( user._id).select("-password -refreshToken")
  
     // check for user creation
     if(!createdUser){
        throw new ApiError(500,"Somting went wrong User not Register succesfully")
     }

     // return res
     return res.status(201).json( new ApiResponse(200, createdUser,"User register succesfully",))

})

export {
    registerController
}