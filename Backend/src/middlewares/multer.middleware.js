import multer from "multer";

import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp") // Ensure ye folder exist karta ho
  },
  filename: function (req, file, cb) {
    // Unique name dene ke liye extensions ke saath
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, baseName + '-' + Date.now() + ext)
  }
})

export const upload = multer({
  storage,
})