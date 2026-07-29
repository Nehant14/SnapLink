// Read this first
// now in this file we are defining with jsDocs as we are using javascript
// here we made this file just "TO HELP VSCODE OR CODE EDITOR TO PROVIDE PROPER CODE AND TYPE SUGGESTIONS"
// you can think of it like TYPE-HINTS of python
// we are making a single file with all the types and then importing this file in other files to use vscode suggestions

/**
 * @typedef {Object} UrlRecord
 * @property {import('mongoose').Types.ObjectId} _id
 * @property {String} shortCode
 * @property {String} longUrl
 * @property {Date} createdAt
 * @property {Date|null} expiresAt
 * @property {string|null} userId
 */


/**
 * @typedef {Object} CreateUrlDTO
 * @property {string} longUrl
 * @property {string} [customAlias]
 * @property {string} [expiresAt]
 */


module.exports = {}






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