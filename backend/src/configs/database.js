const config = require('./index');
const mongoose = require('mongoose');


const connectDB = async () => {

    try {

        await mongoose.connect(config.db.uri);

        console.log("Database Connected Successfully!!!");

    }
    catch (err) {

        console.error("Database Connection Failed");
        console.error(err);

        process.exit(1);

    }

};


// closeDB() is called when the server shuts down (SIGTERM/SIGINT)
// It closes the mongoose connection properly instead of letting the
// process die with an open socket
const closeDB = async () => {

    await mongoose.connection.close();
    console.log("Database Connection Closed");

};


const getDb = () => {

    if (mongoose.connection.readyState !== 1) {
        throw new Error("Database not connected yet");
    }
    return mongoose.connection;

};

module.exports = { connectDB, closeDB, getDb };
