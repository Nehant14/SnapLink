// Read this first
// now in this file we are defining with jsDocs as we are using javascript
// here we made this file just "TO HELP VSCODE OR CODE EDITOR TO PROVIDE PROPER CODE AND TYPE SUGGESTIONS"
// you can think of it like TYPE-HINTS of python
// we are making a single file with all the types and then importing this file in other files to use vscode suggestions

// The below JSDoc typedefs are useful when using the MongoDB Driver.
// Since we are using Mongoose, the schema itself defines the document structure.


// /**
//  * @typedef {Object} UrlRecord
//  * @property {import('mongoose').Types.ObjectId} _id
//  * @property {String} shortCode
//  * @property {String} longUrl
//  * @property {Date} createdAt
//  * @property {Date|null} expiresAt
//  * @property {string|null} userId
//  */


// /**
//  * @typedef {Object} CreateUrlDTO
//  * @property {string} longUrl
//  * @property {string} [customAlias]
//  * @property {string} [expiresAt]
//  */


// module.exports = {}






// In Typescript we do the above things as (with the use of Interfaces and directly exporting it):
// we did : export interface (directly here)

// import { ObjectId } from 'mongodb';  // this is just used to define an objectID, interfaces does not require mongoDB
                                        // here it is defined just because we needed ObjectId here and nothing else

// // Replaces UrlRecord @typedef
// export interface UrlRecord {
//   _id: ObjectId;
//   short_code: string;
//   long_url: string;
//   created_at: Date;
//   expires_at: Date | null;
//   user_id: string | null;
// }

// // Replaces CreateUrlDTO @typedef
// export interface CreateUrlDTO {
//   longUrl: string;
//   customAlias?: string; // Optional property
//   expiresAt?: string;   // Optional property
// }




const mongoose = require('mongoose');

const Schema = mongoose.Schema;

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
    },

    // expires_at holds the expiry date for a short link.
    // default: null means "never expires" unless the user set one at creation.
    // The `index: { expireAfterSeconds: 0 }` part creates a TTL index —
    // MongoDB's background reaper (runs every ~60s) automatically deletes
    // any document once expires_at is in the past. We don't need a manual
    // cron job / deleteExpired() function because of this.
    expiresAt: {
        type: Date,
        default: null,
        index: { expireAfterSeconds: 0 }
    }

}, {
    // timestamps: true would normally add both created_at and updated_at
    // automatically. We only want created_at since we never update a
    // short URL document after creation, so updatedAt is disabled.
    timestamps: { createdAt: 'created_at', updatedAt: false }
});



// In database.js, we created functions to connect to and close the MongoDB database.
// Here, we define the structure of our URL documents using a Mongoose schema
// and create a model to interact with the database.


// URLStore is the Mongoose model created from urlSchema.
// 'URL' is the model name, and urlSchema defines the structure of the documents.
// URLStore is the JavaScript variable that stores and refers to this model.
const URLStore = mongoose.model('URL', urlSchema);


// Export the model so it can be used in other files to perform
// database operations like create, find, update, and delete.
module.exports = URLStore;