const path = require('path');
const multer = require('multer');

var excelStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'excel-uploads/');
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, 'excel_' + Date.now() + ext);
  },
});

var excelUpload = multer({
  storage: excelStorage,
  fileFilter: function (req, file, callback) {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel' // older version
    ) {
      callback(null, true);
    } else {
      console.log('Seuls les fichiers xls, xlsx sont acceptés');
      callback(new Error('Seuls les fichiers xls, xlsx sont acceptés'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 10, 
  },
});

module.exports = excelUpload;
