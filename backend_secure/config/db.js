const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8"]);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");
        console.log("Connected Host:", mongoose.connection.host);
        console.log("Connected DB:", mongoose.connection.name);

    } catch (error) {
        console.log("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;