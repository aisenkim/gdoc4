const path = require("path");
const ImageModel = require("../models/image");

const keyToMime = new Map();

// ------------------------------ LOCAL ----------------------------------------

const uploadSingleImage = async (req, res) => {
  res.setHeader("X-CSE356", "61f9c246ca96e9505dd3f812");
  const file = req.file;
  console.log(req.file);
  const mimeType = file.mimetype;
  if (
    mimeType !== "image/png" &&
    mimeType !== "image/jpeg" &&
    mimeType !== "image/gif"
  )
    return res.json({
      error: true,
      message: `Image mimetype needs to be jpeg or png. Received: ${mimeType}`,
    });
  console.log("file mime type: ", mimeType);

  // SETUP LOCAL CACHE
  keyToMime.set(file.filename, mimeType);

  const imageDoc = await ImageModel.create({
    key: file.filename,
    mimeType,
    port: process.env.PORT,
  });
  if (!imageDoc)
    return res.json({
      error: true,
      message: `Error saving image info to mongodb`,
    });

  return res.json({
    mediaid: file.filename,
  });
};

const getSingleImage = async (req, res) => {
  res.setHeader("X-CSE356", "61f9c246ca96e9505dd3f812");
  const key = req.params.MEDIAID;
  const mimeCache = keyToMime.get(key);
  if(!mimeCache) {
    try {
      const imageDoc = await ImageModel.findOne({key});
      res.setHeader("Content-Type", imageDoc.mimeType);
    } catch (err) {
      console.log(err);
    }
  } else {
    res.setHeader("Content-Type", mimeCache);
  }
  res.sendFile(path.join(__dirname, `../uploads/${key}`));
};

module.exports = {
  uploadSingleImage,
  getSingleImage,
};
