const multer = require("multer");

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./data/uploads/"); // Uploads will be stored in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // File will be renamed with a timestamp prefix
  },
});

const upload = multer({ storage: storage });

const UploadSingleFile = () => upload.single("file");

module.exports = {
  UploadSingleFile,
};
