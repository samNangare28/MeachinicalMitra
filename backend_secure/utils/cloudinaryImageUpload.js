const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadImage = (fileBuffer, folder = "mechanical-mitra/thumbnails") => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(

            {
                resource_type: "image",
                folder,
                // Reasonable cap + auto quality so no one can smuggle in a
                // huge decompression-bomb-style image under the 5MB byte cap.
                transformation: [{ width: 1600, height: 1600, crop: "limit" }],
                quality: "auto"
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

module.exports = uploadImage;
