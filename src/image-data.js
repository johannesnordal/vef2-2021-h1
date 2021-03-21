import dotenv from 'dotenv';
import util from 'util';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const {
  CLOUDINARY_URL: cloudinaryURL = null,
} = process.env;

if (!cloudinaryURL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

export const uploadAsync = util.promisify(cloudinary.uploader.upload);
export const resourcesAsync = util.promisify(cloudinary.api.resources);
export const resourcesByIdAsync = util.promisify(cloudinary.api.resources_by_ids);

let images = null;

export async function uploadImage(imagePath) {
  const name = path.basename(imagePath);
  const pathname = path.normalize(imagePath);

  if (!images) {
    const res  = await resourcesAsync({ max_results: 500 });

    images = res.resources
  }

  for (const image of images) {
    if (image.public_id === name) {
      return image.secure_url;
    }
  }

  const { secure_url } = await uploadAsync(pathname,
    {
      unique_filename: false,
      overwrite: false,
      public_id: name,
      allowed_formats: 'jpg,png,gif',
    });

  return secure_url;
}

export default {
  uploadImage,
  uploadAsync,
  resourcesAsync,
}
