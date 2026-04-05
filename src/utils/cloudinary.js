import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOncloudinary= async (filePath)=>{
  try {
      if (!filePath) {
    throw new Error('File path is required');
  }
    // Uploads file to Cloudinary
    const result= await cloudinary.uploader.upload(filePath,{
      resource_type: "auto",
    });
    fs.unlinkSync(filePath); // Delete the local file after successful upload  
    return { url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    fs.unlinkSync(filePath); // Delete the local file in case of an error
    throw error;
  }               
 };

 export{ uploadOncloudinary}

