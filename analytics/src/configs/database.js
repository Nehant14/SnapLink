const config = require('./index');
const mongoose = require('mongoose');


const connectDB = async () => {

    try {

        // dbName is a separate DB name (snaplink_analytics) on the SAME
        // Mongo cluster the backend uses — reuses infra, keeps click data
        // physically separate from the URL/user collections.
        await mongoose.connect(config.db.uri, { dbName: config.db.name });

        console.log("Database Connected Successfully!!!");

    }
    catch (err) {

        console.error("Database Connection Failed");
        console.error(err);

        process.exit(1);

    }

};


const closeDB = async () => {

    await mongoose.connection.close();
    console.log("Database Connection Closed");

};


module.exports = { connectDB, closeDB };
