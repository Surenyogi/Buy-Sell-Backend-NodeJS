"use strict";

var cloudinary = require("cloudinary");

cloudinary.v2.config({
  cloud_name: "nerusalmighty",
  api_key: "296469425293373",
  api_secret: "JuzzZ1sZen5NkWDvpiLjA8y_AAs"
});

exports.uploader = function _callee(files) {
  var pictureFiles, multiplePicturePromise, imageResponses;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          pictureFiles = files;

          if (pictureFiles) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", []);

        case 4:
          multiplePicturePromise = pictureFiles.map(function (picture) {
            return cloudinary.v2.uploader.upload(picture.path);
          });
          _context.next = 7;
          return regeneratorRuntime.awrap(Promise.all(multiplePicturePromise));

        case 7:
          imageResponses = _context.sent;
          return _context.abrupt("return", imageResponses.map(function (image) {
            return image.secure_url;
          }));

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", _context.t0);

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 11]]);
};