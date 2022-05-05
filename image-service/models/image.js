const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const ImageSchema = new Schema(
    {
        key: {type: String, required: true},
        mimeType: {type: String, require: true},
        port : {type: Number, required: true}
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Image', ImageSchema)
