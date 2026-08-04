const {ConflictError, NotFoundError} = require("../utils/error")



class UrlShortenerService {


    constructor(repository, cache, allocator, encode){
        

        this.repository = repository;   // we get MongoUrlRepo's instance as argument so we do the done line else if not provided then we can directly do like : this.repository = new MongoUrlRepo;  which automatically make the instance for us to work with but all the imports need -> we are doing that in app.js not here
        this.cache = cache;           // e.g. redisCache instance
        this.allocator = allocator;   // e.g. RangeAllocator instance
        this.encode = encode;         // base62.encode function

    }

    async createShortUrl({ longUrl, customShortCode, expiresAt }){

        let shortUrl;

        if(customShortCode){    // if they pass custom shortcode then only if will work otherwise not

            const isAvailable = await this.repository.isShortCodeAvailable(customShortCode);

            if(!isAvailable){   // if taken error will be thrown

                throw new ConflictError(`${customShortCode} is already taken`);

            }

            // if not taken then we will pass 
            shortUrl = customShortCode;

        }else{

            const numericId = await this.allocator.getNextId();
            shortUrl = this.encode(numericId);
        }

        let parsedExpiresAt;

        if(expiresAt){
            parsedExpiresAt = new Date(expiresAt);

        }else{

            parsedExpiresAt = null;
        }


        // we add it in our mongoDB database
        console.log(`[CREATE] writing "${shortUrl}" -> "${longUrl}" to MONGO`);
        await this.repository.create(shortUrl, longUrl, parsedExpiresAt);
        console.log(`[CREATE] "${shortUrl}" saved in MONGO`);

        // then return the shortUrl
        return shortUrl;


    }


    async resolveShortCode(shortCode){

        const cached = await this.cache.get(shortCode);

        if(cached){

            console.log(`[RESOLVE] "${shortCode}" served from REDIS (cache hit)`);
            return cached;
        }

        console.log(`[RESOLVE] "${shortCode}" not in Redis, falling back to MONGO`);

        const record = await this.repository.findShortCode(shortCode);

        // is Expired is the private function that we wrote at the end of the class
        if(!record || await this.isExpired(record)){
            console.log(`[RESOLVE] "${shortCode}" not found in MONGO (or expired)`);
            throw new NotFoundError(`${shortCode} is not found`);
        }

        console.log(`[RESOLVE] "${shortCode}" found in MONGO -> ${record.originalURL}`);

        // we are setting cache first
        await this.cache.set(shortCode, record.originalURL);
        console.log(`[RESOLVE] "${shortCode}" backfilled into REDIS for next time`);

        return record.originalURL;
    }


    // here record will be jsDocument that contain all the Schema fields
    async isExpired(record){
        
        if(!record.expiresAt){
            return false;
        }

        return new Date(record.expiresAt) < new Date();   // this checks if the expired date is less than todays date
    }
}   


module.exports = UrlShortenerService;