// this one is for a route that is not found (or the route that doesn't exists)

function notFoundHandler(req, res){

    return res.status(404).json({
        error : "NotFoundError",
        message : `Route ${req.method} ${req.originalUrl} is not found`
    })
}

module.exports = notFoundHandler;