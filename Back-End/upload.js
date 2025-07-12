const multer = require('multer');
const path = require('path');

// إعداد التخزين في المجلد images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/'); // تخزين الصور في مجلد images
  },
  filename: (req, file, cb) => {
    // تغيير اسم الملف لحفظه بشكل فريد (تجنب التكرار)
    cb(null, Date.now() + path.extname(file.originalname)); // إضافة توقيت للمساعدة في التفريق بين الملفات
  }
});

// إعداد multer للتحقق من نوع الصورة وحجمها
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // الحد الأقصى لحجم الصورة: 5MB
});

module.exports = upload;
