
// Now we are creating custom Error showing file with are custom HTTP status code

class NotFoundError extends Error
{
    
    constructor(message = 'Resource Not Found'){
        super(message);  // using super instead of throw new Error helps in many  way like throw error + give error line too and many things
        // also the below variables name, statusCode, message and other are from Error class that we have to extend to use it

        this.name="NotFoundError";

        // Below 2 things are not variables of js error class, we have defined the following variables by use only and gave them value
        // we don't have to define them first and then give value in js, we can do this in runtime
        // in the languages : we first do : int statusCode and then do this.statuscode = 404, but here you can directly do the below
        this.statusCode=404;
        this.isOperational=true;

        Error.captureStackTrace(this, this.constructor);  // if we don't use this, Our error constructor is shown, with this : we give clean error properties that we defined inside the constructor

    }
}


class ConflictError extends Error
{
    
    constructor(message = 'Resource already Exist'){
        super(message);  
        this.name="ConflictError";

        this.statusCode=409;
        this.isOperational=true;

        Error.captureStackTrace(this, this.constructor);

    }
}


class ValidationError extends Error
{
    
    constructor(message = 'Validation Faild.', detail = null){
        super(message);  
        this.name="ValidationError";

        this.statusCode=400;
        this.isOperational=true;
        this.detail=detail;

        Error.captureStackTrace(this, this.constructor);

    }
}


class UnauthorizedError extends Error
{
    
    constructor(message = 'Authorization Failed'){
        super(message);  
        this.name="UnauthorizedError";

        this.statusCode=401;
        this.isOperational=true;

        Error.captureStackTrace(this, this.constructor);

    }
}



class TooManyRequestError extends Error
{
    
    constructor(message = 'Too Many Request'){
        super(message);  
        this.name="TooManyRequestError";

        this.statusCode=429;
        this.isOperational=true;

        Error.captureStackTrace(this, this.constructor);

    }
}


module.exports = {ValidationError, ConflictError, TooManyRequestError, UnauthorizedError, NotFoundError};




