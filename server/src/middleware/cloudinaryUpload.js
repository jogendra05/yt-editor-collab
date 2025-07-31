upload.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only video files are allowed!"), false);
  },
});

export const uploadToCloudinary = async (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "youtube-editor-videos",
        resource_type: "video",
        public_id: filename,
        transformation: [
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    Readable.from(fileBuffer).pipe(stream);
  });
};

export default upload;

// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "youtube-editor-videos",
//     resource_type: "video",
//     allowed_formats: ["mp4", "mov", "avi", "mkv"],
//     transformation: [
//       { quality: "auto" },
//       { fetch_format: "auto" }
//     ]
//   },
// });

// const upload = multer({ 
//   storage,
//   limits: {
//     fileSize: 2 * 1024 * 1024 * 1024, // 2GB limit
//   },
//   fileFilter: (req, file, cb) => {
//     // Accept only video files
//     if (file.mimetype.startsWith('video/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only video files are allowed!'), false);
//     }
//   }
// });

// export default upload;