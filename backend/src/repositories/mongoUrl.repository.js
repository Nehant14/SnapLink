// Now we made a file in configs to just connect with MongoDB
// Now we are creating this repository file, which will communicate with MongoDB
// and perform all database-related operations (CRUD).

// For Redis we have made connectRedis and all tasks in that file only in cache folder becauase redis has only small
// responsiblities and easy commands

// We use two different files for MongoDB to keep the code organized.
// database.js only handles connecting to MongoDB.
// This file uses that connection to perform all database operations like
// insert, find, update, and delete.


const {ConflictError} = require("../utils/error")


// we will be exporting this the functions and classes below for other to perform db functions
// also required thing is that db should be connected before running the below functions
// or use connectDB operation before running any of the functions below


class MongoUrlRepo {
    constructor() {
        
    }
}

