import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    if (!localFilePath) return null;
    const uploadOptions = {
      resource_type: "auto"
    };

    const response = await cloudinary.uploader.upload(localFilePath, uploadOptions);
    // console.log("File is uploaded", response.url);
    fs.unlinkSync(localFilePath); // hata de local file ko
    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // hata de local file ko if it exists
    }
    return null;
  }
};

export { uploadOnCloudinary };
