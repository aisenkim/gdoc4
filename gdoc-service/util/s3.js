const S3 = require("aws-sdk/clients/s3")
const fs = require("fs")

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({region, accessKeyId, secretAccessKey});

// Uploads file to S3
const uploadFile = (file) => {
    const fileStream = fs.createReadStream(file.path);

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename,
    };

    return s3.upload(uploadParams).promise();
};

// Downloads file from s3
const getFile = (fileKey) => {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName,
    };
    return s3.getObject(downloadParams).createReadStream();
};

module.exports = {
    uploadFile,
    getFile
}