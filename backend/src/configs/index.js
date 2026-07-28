// This file is used by us to process .env files and send .env variable to all the files from this single file
/**
 * It goes like :
 *      .env ----> src/configs/index.js  ----> then all other files
 */


// NO OTHER FILE in this project SHOULD READ process.env (that contain key and values of .env)
// directly — every file imports { getConfig } if they want .env values 
// They should not call process.env by themself
// Note: this file does NOT call dotenv.config() itself. That happens once,
// at the very top of server.js (the entry point), before this module is
// ever required — so by the time getConfig() runs, process.env is already
// populated. This file assumes that's true and just reads it.


const REQUIRED_VAL = ["PORT", "MONGODB_NAME", "MONGODB_URL", "REDIS_HOST", "REDIS_PORT", 
                    "REDIS_USERNAME", "REDIS_PASSWORD", "REDIS_TTL"];   // create arry of strings


function getConfig(){

    // Now always first we check if any of the values if missing, this helps to prevent error afterwards in other files
    // Below is a good way but there are more than one for this like : using find, or writing a normal for loop like 
    
    // below is the find() way
    // const missingKey = REQUIRED_VAL.find((key) => !process.env[key]);  // it returns the first key thats undefined
    // if (missingKey) {
    //     throw new Error(`${missingKey} is missing in .env`);
    // }

    // below is the EASIEST WAY :
    // for(const key of REQUIRED_VAL){
    //     if(!process.env[key]){
    //         throw new Error(`${key} is missing`)
    //     }
    // }

    // using forEach
    // REQUIRED_VAL.forEach((key) => {
        
    //     if(!process.env[key]){
    //         throw new Error(`${key} is missing`)
    //     }
    // })


    // This is the best which give all the missing keys
    const missing = REQUIRED_VAL.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(
        `Missing required environment variable(s): ${missing.join(', ')}`  // we used .join to join all missing value using comma(,) and return to tell user
        );
    }

    

    // now we're loading process.env (.env file) values in the variables
    const port = process.env.PORT;
    const mongodb_name = process.env.MONGODB_NAME;
    const mongodb_url = process.env.MONGODB_URL;
    const redis_host = process.env.REDIS_HOST;
    const redis_port = process.env.REDIS_PORT;
    const redis_username = process.env.REDIS_USERNAME;
    const redis_password = process.env.REDIS_PASSWORD;
    const redis_ttl = process.env.REDIS_TTL;



    // below dictonary will contain all the variables and this will be return by this function
    const configStore = {

        // server port
        port,

        // used for main storage
        db : {
            uri : mongodb_url,
            name : mongodb_name
        },

        // used for cache, fast lookup
        redis : {
            host : redis_host,
            port : redis_port,
            username : redis_username,
            password : redis_password,
            ttl : redis_ttl
        }


    }

    // now here we are returning config object by freezing it
    // after freezing we can't change its value, so no file should change it and for making it read only

    return Object.freeze(configStore);


}


// important : here we are storing the return value of getConfig function (which is the object that contain .env file value), storing it in 'config' variable
// it is for ease of use only, as getConfig did its job of checking for undefined values and returned us key-value object
const config = getConfig();

// we are now exporting the object 'config' not the getConfig function
module.exports = config;
