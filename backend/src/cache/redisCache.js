const config = require("../configs/index");
const Redis = require("ioredis");

const client = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    username: config.redis.username,
    password: config.redis.password
});


client.on('error', err => console.log('Redis Client Error', err));


// ioredis connects automatically upon creation — no need for client.connect()
async function connectRedis() {
    // ioredis connects automatically upon creation — no need for client.connect()
    console.log("Redis Connected Succeddfully!!!")

    return client;
}

class RedisCacheFunctions {

    async get(key){
        
        const result = await client.get(key);

        return result;

    }

    async set(key, value, ttlSeconds = config.redis.ttl){

        if(ttlSeconds){
            await client.set(key, value, 'EX', ttlSeconds);
        } else {
            await client.set(key, value);
        }
    }

    async del(key){

        await client.del(key);
    }

}

const redisCache = new RedisCacheFunctions();

module.exports = {connectRedis, redisCache};