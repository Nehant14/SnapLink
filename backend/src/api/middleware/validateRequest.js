const { ValidationError } = require("../../utils/error");


// it takes zod schema as argument, we are exporting this function to the other file and 
// in that file we will use this middleware function to do the task
function validateRequest(schema) {

    // we will return the below arrow function (we are return function(middleware) from the function(validateRequest))
    const middleware = (req, res, next) => {

        // checking if it satisfies the schema (zod one)
        const result = schema.safeParse(req.body);

        if (!result.success) {


            const details = result.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));

            return next(new ValidationError('Invalid request body', details));
        }

        // Replace req.body with the validated data. (possibly updated according to zod schema)
        // This ensures the NEXT middleware or controller receives clean, validated input.
        req.body = result.data;


        next();
        
    }

    // now we are returning the arrow function
    return middleware;
}

module.exports = validateRequest;