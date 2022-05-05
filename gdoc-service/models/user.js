const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const UserSchema = new Schema(
    {
        name: {type: String, require: true},
        email: {type: String, required: true},
        password: {type: String, required: true},
        verificationCode: {type: String, required: true},
        verified: {type: Boolean,  default: false}
    }
)

module.exports = mongoose.model('User', UserSchema)
