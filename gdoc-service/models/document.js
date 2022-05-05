const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const DocumentSchema = new Schema(
    {
        docid: {type: String, required: true},
        name: {type: String, require: true},
        version: {type: Number, default: 0}
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Document', DocumentSchema)
