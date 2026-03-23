import {User} from "../models/user.models.js"
import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {uploadOncloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


  // helper function to generate access token and refresh token
const generateAccessTokenAndRefreshToken = async (user_id)=>{

    try {
         const user = await User.findById(user_id)
        if(!user){
            throw new ApiError(404,"User not found")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Error while generating access and refresh token")
    }
}
// Register controller
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

// login controller
const loginController = asyncHandler(async(req,res)=>{
      const {username , email, password}=req.body

        if(!username && !email){
            throw new ApiError(400,"Username or email is required")
        }


       const  user = await User.findOne({
            $or:[
                {email},    
                {username}
            ]
        })
            if(!user){
                throw new ApiError(404,"User not found with this email or username")
            }

            const isPasswordMatch = await user.comparePassword(password)

            if(!isPasswordMatch){
                throw new ApiError(401,"Invalid password")
            }

            // generate access token
            const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

            const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

             if(!loggedInUser){
                throw new ApiError(500,"Something went wrong while login user")
             }

             const option = {

                httpOnly:true,
               secure:true
             }

            // return res
            return res.status(200)
            .cookie("refreshToken",refreshToken,option)
            .cookie("accessToken",accessToken,option)
            .json(new ApiResponse(200, loggedInUser,"User login succesfully",))
})

// logoutCotroller
const logoutController = asyncHandler(async(req,res)=>{
    const userId = req.user._id
    await User.findByIdAndUpdate(userId, {
        $unset: {
            refreshToken: 1
        }
    }, {
        new: true
    })

    const option = {

        httpOnly:true,
       secure:true
     }

    return res.status(200)
    .clearCookie("refreshToken",option)
    .clearCookie("accessToken",option)
    .json(new ApiResponse(200, {},"User logged out succesfully",))
})

const refreshTokenController = asyncHandler(async(req,res)=>{
    const refreshToken = req.cookies.refreshToken || req.headers.authorization?.split(" ")[1]
    if(!refreshToken){
        throw new ApiError(401,"Unauthorized: No refresh token provided")
    }

    try {
        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(404,"User not found")
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)

        const option = {
            httpOnly:true,
            secure:true
        }

        return res.status(200)
        .cookie("refreshToken", newRefreshToken, option)
        .cookie("accessToken", accessToken, option)
        .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken},"Refresh token generated successfully",))

    } catch (error) {
        throw new ApiError(401,"Invalid refresh token")
    }
})

export {
    registerController,
    loginController,
    logoutController,
    refreshTokenController
}