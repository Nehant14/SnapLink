// Now we made a file in configs to just connect with MongoDB
// Now we are creating this repository file, which will communicate with MongoDB
// and perform all database-related operations (CRUD).

// For Redis we have made connectRedis and all tasks in that file only in cache folder becauase redis has only small
// responsiblities and easy commands

// We use two different files for MongoDB to keep the code organized.
// database.js only handles connecting to MongoDB.
// This file uses that connection to perform all database operations like
// insert, find, update, and delete.

// Below we took one error function only from error.js
const {ConflictError} = require("../utils/error")

// below we imported mongoDB model from url.model.js
const URLStore = require("../models/url.model")


// we will be exporting this the functions and classes below for other to perform db functions
// also required thing is that db should be connected before running the below functions
// or use connectDB operation before running any of the functions below


class MongoUrlRepo {

    // now first me define model inside the class we the variable 'model' with the constructor that defines model variable at the start only and then we can use it in other functions
    constructor(model=URLStore) {
        this.model=model;
    }


    async create(shortCode, longUrl, expiresAt){

        try {

            // shortURL, originalURL and expiresAt are the variable that we defined in model schema : url.model.js
            const doc = await this.model.create({
                shortURL : shortCode,
                originalURL : longUrl,
                expiresAt : expiresAt
            })

            return doc.toObject();  // thise return a js object that contain the above data and many other things
        }
        catch(err){

            if(err.code==11000){
                throw new ConflictError(`short url ${shortCode} is already present in the Database`)
            }
            throw err;  // this is important to through our error + js error too to stop the work with err
        }

    }

    async findShortCode(shortCode){

        return this.model.findOne({shortURL : shortCode}).lean();   
        // .lean convert mongoose document (that has method) to js object (remember : js object are like dictonary in python)
    }

    async isShortCodeAvailable(shortCode){

        const doc = this.model.findOne({shortURL : shortCode});

        return doc !== null;   // if available then return true else false
    }

    // Delete operation is not yet added

}


// now we are exporting a class so if this is imported in other file, first we have to create its instance first
module.exports = MongoUrlRepo;  

