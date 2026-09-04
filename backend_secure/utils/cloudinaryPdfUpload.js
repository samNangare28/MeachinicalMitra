const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadPdf = (fileBuffer) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(

            {
                resource_type: "raw",
                folder: "mechanical-mitra/lectures/pdf"
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

module.exports = uploadPdf;