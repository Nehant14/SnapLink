
// This file is used by us to process .env files and send .env variable to all the files from this single file
/**
 * It goes like :
 *      .env ----> src/configs/index.js  ----> then all other files
 */


const REQUIRED_VAL = ["PORT", "MONGODB_NAME", "MONGODB_URL", "REDIS_HOST", "REDIS_PORT", 
                    "REDIS_USERNAME", "REDIS_PASSWORD", "REDIS_TTL"];   // create arry of strings


function getConfig(){


    // This is the best which give all the missing keys
    const missing = REQUIRED_VAL.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(
        `Missing required environment variable(s): ${missing.join(', ')}`  
        );
    }

    


    const port = process.env.PORT;
    const mongodb_name = process.env.MONGODB_NAME;
    const mongodb_url = process.env.MONGODB_URL;
    const redis_host = process.env.REDIS_HOST;
    const redis_port = process.env.REDIS_PORT;
    const redis_username = process.env.REDIS_USERNAME;
    const redis_password = process.env.REDIS_PASSWORD;
    const redis_ttl = process.env.REDIS_TTL;

    // below one is for rate limiting
    rate_limit_window_ms = process.env.RATE_LIMIT_WINDOW_MS || 15*60*100;  // tells 15min (is is 15 * 60 * 1000 (milliseconds))
    rate_limit_max = process.env.RATE_LIMIT_MAX || 100  // tells number of request
    // above value tell about 100 requests per 15 min


    const node_env = process.env.NODE_ENV || 'development';
    const base_url = process.env.BASE_URL || `http://localhost:${port}`;



    // below dictonary will contain all the variables and this will be return by this function
    const configStore = {

        // server port
        port,

        // environment ('development' / 'production' / 'test')
        nodeEnv : node_env,

        // used to build the full short link, e.g. baseUrl + "/" + shortCode
        baseUrl : base_url,

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
        },

        // used by rateLimiter.js to protect the shorten endpoint from spam
        rateLimit : {
            windowMs : rate_limit_window_ms,
            max : rate_limit_max
        },


    }


    // we freeze before returning
    return Object.freeze(configStore);


}


const config = getConfig();


module.exports = config;
