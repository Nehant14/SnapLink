const { z } = require("zod");

const signupSchema = z.object({

    email: z.string().email({ message: 'email must be a valid email address' }),

    password: z.string()
        .min(8, 'password must be at least 8 characters'),

    name: z.string()
        .min(1)
        .max(60)
        .optional(),

});

const loginSchema = z.object({

    email: z.string().email({ message: 'email must be a valid email address' }),

    password: z.string()
        .min(1, 'password is required'),

});

module.exports = { signupSchema, loginSchema };
