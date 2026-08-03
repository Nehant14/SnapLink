const {z} = require("zod");


const shortenSchema = z.object({

    longUrl : z.string().url({message : "longUrl must be valid Url"}),

    customAlias: z.string()
        .min(3, 'customAlias must be at least 3 characters')
        .max(20, 'customAlias must be at most 20 characters')
        .regex(/^[a-zA-Z0-9]+$/, 'customAlias must be alphanumeric')
        .optional(),
    // .optional() means the field is not compulsary, if it is missing then also OK

    expiresAt: z.string()
        .datetime({ message: 'expiresAt must be a valid ISO date' })
        .refine((date) => new Date(date) > new Date(), {
            message: 'expiresAt must be in the future',
        })
        .optional(),

})


module.exports = {shortenSchema};