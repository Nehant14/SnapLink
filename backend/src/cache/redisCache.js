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

        if (result) {
            console.log(`[REDIS] GET hit  -> key="${key}" value="${result}"`);
        } else {
            console.log(`[REDIS] GET miss -> key="${key}" (not in cache)`);
        }

        return result;

    }

    async set(key, value, ttlSeconds = config.redis.ttl){

        if(ttlSeconds){
            await client.set(key, value, 'EX', ttlSeconds);
            console.log(`[REDIS] SET -> key="${key}" value="${value}" ttl=${ttlSeconds}s`);
        } else {
            await client.set(key, value);
            console.log(`[REDIS] SET -> key="${key}" value="${value}" ttl=none`);
        }
    }

    async del(key){

        await client.del(key);
    }

}

const redisCache = new RedisCacheFunctions();

module.exports = {connectRedis, redisCache};