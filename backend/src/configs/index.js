// This file is used by us to process .env files and send .env variable to all the files from this single file
/**
 * It goes like :
 *      .env ----> src/configs/index.js  ----> then all other files
 */


const REQUIRED_VAL = ["PORT", "MONGODB_NAME", "MONGODB_URL", "REDIS_HOST", "REDIS_PORT", 
                    "REDIS_USERNAME", "REDIS_PASSWORD", "REDIS_TTL", "JWT_SECRET"];   // create arry of strings


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
    const redis_port = Number(process.env.REDIS_PORT);
    const redis_username = process.env.REDIS_USERNAME;
    const redis_password = process.env.REDIS_PASSWORD;
    const redis_ttl = Number(process.env.REDIS_TTL);

    // below one is for rate limiting
    const rate_limit_window_ms = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15*60*1000;  // 15min in milliseconds
    const rate_limit_max = Number(process.env.RATE_LIMIT_MAX) || 100  // tells number of request
    // above value tell about 100 requests per 15 min


    const node_env = process.env.NODE_ENV || 'development';
    const base_url = process.env.BASE_URL || `http://localhost:${port}`;

    // block size used by RangeAllocator to reserve numeric IDs in batches
    const id_gen_block_size = Number(process.env.IDGEN_BLOCK_SIZE) || 1000;

    // --- auth ---
    const jwt_secret = process.env.JWT_SECRET;
    const jwt_expires_in = process.env.JWT_EXPIRES_IN || '7d';
    const bcrypt_salt_rounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    // how long the JWT cookie itself lives in the browser, in ms. Kept in
    // sync with jwt_expires_in's default (7 days) unless overridden.
    const auth_cookie_max_age_ms = Number(process.env.AUTH_COOKIE_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000;

    // --- anonymous session (pre-signup link history tracking) ---
    // cookie that identifies a browser session before the visitor has an
    // account, so history and 48h-expiry links can be traced back to "this
    // browser" and later migrated onto an account on signup.
    const anon_session_cookie_name = process.env.ANON_SESSION_COOKIE_NAME || 'anon_session_id';
    const anon_session_max_age_ms = Number(process.env.ANON_SESSION_MAX_AGE_MS) || 90 * 24 * 60 * 60 * 1000;

    // how long an anonymous (no-account) link lives before it's reaped by
    // Mongo's TTL index, in ms. Fixed business rule, not meant to be tuned
    // per-deployment, but kept overridable for testing.
    const anon_link_ttl_ms = Number(process.env.ANON_LINK_TTL_MS) || 48 * 60 * 60 * 1000;

    // origin the frontend is served from — needed for CORS once cookies
    // (credentials) are involved, since app.use(cors()) with no options
    // does not allow credentialed cross-origin requests.
    const frontend_origin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';



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

        // used by RangeAllocator to reserve blocks of numeric ids at once
        idGen : {
            blockSize : id_gen_block_size
        },

        // used by auth.service.js to sign/verify JWTs and hash passwords
        auth : {
            jwtSecret : jwt_secret,
            jwtExpiresIn : jwt_expires_in,
            bcryptSaltRounds : bcrypt_salt_rounds,
            cookieMaxAgeMs : auth_cookie_max_age_ms
        },

        // name of the httpOnly cookie the JWT is stored in
        cookies : {
            tokenName : 'token'
        },

        // used by anonSession middleware to track pre-signup browsers
        anonSession : {
            cookieName : anon_session_cookie_name,
            maxAgeMs : anon_session_max_age_ms,
            linkTtlMs : anon_link_ttl_ms
        },

        // used by app.js for the CORS allow-list (credentialed requests
        // can't use the wildcard '*' origin)
        cors : {
            origin : frontend_origin
        },


    }


    // we freeze before returning
    return Object.freeze(configStore);


}


const config = getConfig();


module.exports = config;