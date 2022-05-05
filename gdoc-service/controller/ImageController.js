const path = require("path")
const ImageModel = require("../models/image")

// ------------------------------ LOCAL ----------------------------------------

const uploadSingleImage = async (req, res) => {
    const file = req.file;
    console.log(req.file)
    const mimeType = file.mimetype;
    if (mimeType !== "image/png" && mimeType !== "image/jpeg")
        return res.json({
            error: true,
            message: `Image mimetype needs to be jpeg or png. Received: ${mimeType}`,
        })
    console.log("file mime type: ", mimeType);
    const imageDoc = await ImageModel.create({key: file.filename, mimeType, port: process.env.PORT})
    if (!imageDoc)
        return res.json({
            error: true,
            message: `Error saving image info to mongodb`,
        })

    return res.json({
        mediaid: file.filename
    })
};

const getSingleImage = async (req, res) => {
    const key = req.params.MEDIAID;
    try {
        const imageDoc = await ImageModel.findOne({key})
        res.setHeader("Content-Type", imageDoc.mimeType);
    } catch (err) {
        console.log(err)
    }
    console.log(__dirname)
    res.sendFile(path.join(__dirname, `../uploads/${key}`))
};

module.exports = {
    uploadSingleImage, getSingleImage
}
