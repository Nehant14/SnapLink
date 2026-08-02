async function resolve(req, res, next) {


    try {


        const { shortCode } = req.params;

        const longUrl = await req.app.locals.urlShortenerService.resolveShortCode(shortCode);

        res.redirect(302, longUrl);

    } catch (err) {
        next(err); // NotFoundError -> errorHandler -> 404
    }

}

module.exports = { resolve };