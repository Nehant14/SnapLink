const config = require("../configs/index");
const Redis = require("ioredis");


// you can get below commands directly from ioredis documentation
// also ioredis don't need redis client, it automatically connects each time and perform action
// also diff in performace is negligible between redis and ioredis


// this is the main code, ioredis directly connect client upon creation (like created below with 'new Redis' function)
const client = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    username: config.redis.username,
    password: config.redis.password
});


client.on('error', err => console.log('Redis Client Error', err));


async function connectRedis() {
    // ioredis connects automatically upon creation — no need for client.connect()

    // await client.set('foo', 'bar');   // its nothing like we SET key = foo and value = bar
    // const result = await client.get('foo');  // we try to GET value of key (key = foo), we get result = bar
    // console.log(result);
    console.log("Redis Connected Succeddfully!!!")

    return client;
}

// we are storing them as a clean class (better way)
class RedisCacheFunctions {

    async get(key){
        
        const result = await client.get(key);

        return result;

    }

    async set(key, value, ttlSeconds){

        await client.set(key, value, ttlSeconds);
    }

    async del(key){

        await client.del(key);
    }

}

const redisCache = new RedisCacheFunctions(); // created an instance and we will then export it as we can't export class so we export an instance

module.exports = {connectRedis, redisCache};  