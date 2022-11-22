const cloudinary = require("cloudinary");

cloudinary.v2.config({
  cloud_name: "nerusalmighty",
  api_key: "296469425293373",
  api_secret: "JuzzZ1sZen5NkWDvpiLjA8y_AAs",
});

exports.uploader = async (files) => {
  try {
    let pictureFiles = files;
    if (!pictureFiles) return [];
    let multiplePicturePromise = pictureFiles.map((picture) =>
      cloudinary.v2.uploader.upload(picture.path)
    );
    let imageResponses = await Promise.all(multiplePicturePromise);
    return imageResponses.map((image) => image.secure_url);
  } catch (err) {
    return err;
  }
};
