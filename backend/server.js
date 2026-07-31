
const DOTENV = require("dotenv");
DOTENV.config();

const db = require("./src/configs/database");
const redis = require("./src/cache/redisCache");
const app = require("./src/app");


const startServer = async () => {

    await db.connectDB();

    await redis.connectRedis();

    const PORT = process.env.PORT;

    app.listen(PORT, () => {
        console.log(`Server is running at PORT : ${PORT}`);
    });

};


startServer();

