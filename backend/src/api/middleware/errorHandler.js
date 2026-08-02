
// This is main error handler

function errorHandler(err, req, res, next){

    // below it is for our custom errors, you can see isOperational is true in custom errors
    if(err.isOperational){

        const response = {

            error : err.name,
            message : err.message,
        }

        // here we are adding a new field called detail to response (only if it exists), so total field od response becomes -> error, message and detail
        if(err.detail) {
            response.detail = err.detail
        }

        // below is like res -> response sent, res.status(err.statusCode) -> sets the status code of the response, then .json({}) is the actual response which is in json format
        return res.status(err.statusCode).json(response);
    }


    // now below are for any other errors
    console.log('Unexpected Error: ', err);

    return res.status(500).json({
        error: "InternalServerError",
        message: "Something Went Wrong"
    })

}


module.exports = {errorHandler};

