
// This is main error handler

function errorHandler(err, req, res, next){

    // below it is for our custom errors, you can see isOperational is true in custom errors
    if(err.isOperational){

        const response = {

            error : err.name,
            message : err.message,
        }

        if(err.detail) {
            response.detail = err.detail
        }

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

