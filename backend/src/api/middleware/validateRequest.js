const { ValidationError } = require('../../utils/error');

function validateRequest(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.errors.map((issue) => ({
                path: issue.path.join('.') || 'body',
                message: issue.message,
            }));

            return next(new ValidationError('Request validation failed', errors));
        }

        req.body = result.data;
        next();
    };
}

module.exports = validateRequest;
