function errorHandler(err, req, res, next) {

    if (err.isOperational) {

        const response = {
            error: err.name,
            message: err.message,
        };

        if (err.detail) {
            response.detail = err.detail;
        }

        return res.status(err.statusCode).json(response);
    }

    console.error('Unexpected Error: ', err);

    return res.status(500).json({
        error: "InternalServerError",
        message: "Something Went Wrong"
    });

}

module.exports = errorHandler;
