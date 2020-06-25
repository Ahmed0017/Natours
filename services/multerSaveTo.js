const multer = require('multer');

const AppError = require('../utils/appError');

module.exports = (folderName, fileType) => {
  // 1) Create multer storage
  const multerStorage = multer.memoryStorage();

  // 2) Create multer filter
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith(fileType)) {
      return cb(null, true);
    }

    if (fileType === 'pdf' || fileType === 'zip') {
      if (file.mimetype.startsWith('application')) {
        return cb(null, true);
      }
    }

    cb(new AppError(`Please upload only file of type ${fileType}.`, 400));
  };

  return multer({
    storage: multerStorage,
    fileFilter: multerFilter
  });
};
