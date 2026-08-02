async function resolve(req, res, next) {


    try {

        // app.use(express.json()); we will this in app.js to convert all req to json format so req.params work correctly
        const { shortCode } = req.params;

        const longUrl = await req.app.locals.urlShortenerService.resolveShortCode(shortCode);

        res.redirect(302, longUrl);

    } catch (err) {
        next(err); // NotFoundError -> errorHandler -> 404
    }

}

module.exports = { resolve };