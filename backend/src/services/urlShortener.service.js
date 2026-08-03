const {ConflictError, NotFoundError} = require("../utils/error")



// Here we are writing the whole UrlShortener flow and how different files will be used at once
// But here we will not import any of the file, we will just make a constructore so that when 
// we import files (all files with this one) in app.js and pass CLASS INSTANCES to the constructor of the class 
// then everything will start to work

// to understanc this file think like : in other file we import this file :
/*

we pass : const instance = UrlShortenerService(new MongoUrlRepo, redisCache .....)
we passed an instance of MongoUrlRepo class to this class constructor for it to use
so this.repository contain the new MongoUrlRepo instance and then we can use all its function as:
this.repository.create()
this.repository.findShortCode()  inside this class's function

you can check out these function in the class MongoUrlRepo inside mongoUrl.repository.js
 

*/

class UrlShortenerService {

    // this constructure initilize the class variables (in js we directly define class variables during runtime)
    // customShortCode is the shortcode that a user can select a custom url name for its long url
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
        await this.repository.create(shortUrl, longUrl, parsedExpiresAt);

        // then return the shortUrl
        return shortUrl;


    }


    async resolveShortCode(shortCode){

        const cached = await this.cache.get(shortCode);

        if(cached){

            return cached;
        }

        const record = await this.repository.findShortCode(shortCode);

        // is Expired is the private function that we wrote at the end of the class
        if(!record || await this.isExpired(record)){
            throw new NotFoundError(`${shortCode} is not found`);
        }

        // we are setting cache first
        await this.cache.set(shortCode, record.originalURL);

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