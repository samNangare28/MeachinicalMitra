const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadVideo = (fileBuffer) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(

            {
                resource_type: "video",
                folder: "mechanical-mitra/lectures"
            },

            (error, result) => {

                if (error) {

                    reject(error);

                } else {

                    resolve(result);

                }

            }

        );

        streamifier
            .createReadStream(fileBuffer)
            .pipe(stream);

    });

};

module.exports = uploadVideo;