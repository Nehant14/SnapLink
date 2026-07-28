// Most important rule:
// If we are importing our own files, always use ./ or ../ even if files are in same folder
// If we are importing packages, directly write their package name

const config = require('./index');
const mongoose = require('mongoose');


// Now we are connecting to MongoDB, we imported mongoose which is used for MongoDB related tasks in Node.js
// config.db.uri is the value that we imported from config/index.js
// await waits until the database connection is completed

// CALLBACKs (remember callback and promises, can only be used inside async function as we used await with mongoose.connect
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

// OR Directly do : 
// const connectDB = await mongoose.connect(config.db.uri);  // both the above and this method is correct





// Now after connecting we define schemas :

const Schema = mongoose.Schema;      // First we define the object before using

// URI is different from URL : some other knowledge
const urlSchema = new Schema({

    shortURL: {
        type: String,
        required: true,
        unique: true
    },

    originalURL: {
        type: String,
        required: true
    }

});

// Create the model
const URLStore = mongoose.model('URL', urlSchema);


// // Export both so that other files can use them
module.exports = {connectDB, URLStore};









/**
 * Above code is with mongoose but here as we need commands like close db which is easy with with mongoDriver
 * 
 * Mongoose work on top of mongodriver, so overall mongoose is easy to work with
 */




// // Most important rule:
// // If we are importing our own files, always use ./ or ../ even if files are in same folder
// // If we are importing packages, directly write their package name

// const config = require("./index");
// const { MongoClient } = require("mongodb");


// // We keep these outside the functions so that the same connection
// // can be reused throughout the application
// let client;
// let db;


// // connectDB() creates MongoClient, connects to MongoDB,
// // verifies connection using ping command,
// // and returns the Db handle

// const connectDB = async () => {

//     try {

//         // Create MongoClient
//         client = new MongoClient(config.db.uri);
//         // Connect to MongoDB
//         await client.connect();


//         // Get database instance
//         db = client.db(config.db.name);


//         // Verify connectivity
//         await db.command({ ping: 1 });
//         console.log("Database Connected Successfully!!!");


//         // Return Db handle
//         return db;

//     }
//     catch (err) {

//         console.error("Database Connection Failed");
//         console.error(err);

//         process.exit(1);

//     }

// };



// // getDb() returns the singleton Db instance
// // Repositories will use this instead of creating new connections

// const getDb = () => {

//     if (!db) {
//         throw new Error("Database not connected yet");
//     }
//     return db;

// };



// // closeDB() is called when the server shuts down
// // It closes the MongoDB connection properly

// const closeDB = async () => {

//     if (client) {
//         await client.close();
//         console.log("Database Connection Closed");

//     }

// };



// // Export functions so other files can use them

// module.exports = {
//     connectDB,
//     getDb,
//     closeDB
// };