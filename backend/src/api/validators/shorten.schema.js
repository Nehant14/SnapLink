
const {z} = require("zod");


// it is used for validation
/*
without zod you have to write manually like for the below :

app.post("/shorten", (req, res) => {
    const { longUrl } = req.body;

    // What if longUrl is missing or is a number?
});

you have to manually write:
if (!longUrl) {
    return res.status(400).json({ error: "Missing URL" });
}

if (typeof longUrl !== "string") {
    return res.status(400).json({ error: "URL must be a string" });
}

*/



const shortenSchema = z.object({

    long_url : z.string().url({message : "long_url must be valid Url"}),

    custom_alias: z.string()
        .min(3, 'custom_alias must be at least 3 characters')
        .max(20, 'custom_alias must be at most 20 characters')
        .regex(/^[a-zA-Z0-9]+$/, 'custom_alias must be alphanumeric')
        .optional(),
    // .optional() means the field is not compulsary, if it is missing then also OK

    expires_at: z.string()
        .datetime({ message: 'expires_at must be a valid ISO date' })
        .refine((date) => new Date(date) > new Date(), {
            message: 'expires_at must be in the future',
        })
        .optional(),

})


module.exports = {shortenSchema};