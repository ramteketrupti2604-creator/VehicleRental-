import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

console.log("Cloudinary check:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME? "Found ✅" : "MISSING ❌",
  api_key: process.env.CLOUDINARY_API_KEY? "Found ✅" : "MISSING ❌",
  api_secret: process.env.CLOUDINARY_API_SECRET? "Found ✅" : "MISSING ❌"
});

// memory me rakhenge, phir khud upload karenge
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export default cloudinary;