// this one is the controller for shortening url

const config = require("../../configs/index")


async function create(req, res, next){

    try{

        const {longUrl, customAlias, expiresAt} = req.body;

        // ownership decides the real expiry (see urlShortener.service.js) —
        // logged-in users get their custom expiresAt honored (or forever),
        // anonymous visitors always get a hard 48h expiry regardless of
        // what they sent.
        const userId = req.user?.id || null;
        const anonSessionId = userId ? null : (req.anonSessionId || null);

        // it is the shortCode

        // app.locals are global variable that will be set in express app and will be used by everyone ex:
        // app.locals.domain = 'www.sample.com';  // Setting global domain
        // app.locals.age = '24';  // Setting global age
        // app.locals.company = 'ABC Ltd';  // Setting global company

        // for below it'll be (which is written in other file):
        // app.locals.urlShortenerService = new UrlShortenerService(
        //     urlRepository,
        //     redisCache,
        //     allocator,
        //     encode
        // );

        const shortCode = await req.app.locals.urlShortenerService.createShortUrl({
            longUrl : longUrl,
            customShortCode : customAlias,
            expiresAt : expiresAt,
            userId : userId,
            anonSessionId : anonSessionId
        });

        // it is the short url, it will be a string that contain baseUrl + shortCode like : bitly.com -> is baseUrl and 3lhjv3k-> is shortcode 
        // so in total it becomes -> bitly.com/3lhjv3k
        const shortUrl = `${config.baseUrl}/${shortCode}`;

        res.status(201).json({shortUrl : shortUrl});



    }
    catch(err){

        next(err);  // handoff to error handler
    }
}


module.exports = {create};