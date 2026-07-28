// do the below two lines as early as in you file, doing this loads all the key values of .env in process.env
// process has many operations too like process.version => node version, process.platform => linux, windows
// process.exit() => close the node process, process.cwd => current working directory
// if we don't do the below thing then process.env will not contain key values of .env
// MOST IMP THING : as we run server.js first and if we do DOTENV.config at the start : the thing process.env will contain key-value and can be used anywhere in the backend folder
// its like process.env is filled with .env and now any of the file in the backend folder related or unrelated can run this as all are running in the same node process
// Yes — exactly that. Once dotenv.config() has run once, anywhere, process.env is populated for the entire Node process, 
// not just the file that called it. Every file in your backend — related, unrelated, deeply nested, doesn't matter — 
// can read process.env.ANYTHING after that point, because they're all running inside the same single Node process 
// sharing the same global process object.
// Also same terminal => same process , two different files are ran differently (in like two terminal) => two diff process 
// so we can't use process.env in both if this is done only in one file
const DOTENV = require('dotenv')
DOTENV.config()

// Below we are importing database.js
const db = require("./src/configs/database")
db.connectDB();

/* Now here with the above code of dotenv and db we are done with config folder */


/* Below is to initilize Cache */
const redis = require("./src/cache/redisCache")
redis.connectRedis();



const app = require("./src/app")





const PORT = process.env.PORT    // process.env contain values of .env so process.env.PORT gives the value of PORT from .env

// now here wer are listing on the port from the user
// below console.log is the CALLBACK function => that only work if app.listen is working
app.listen(PORT, () => {
    console.log(`Server is running at PORT : ${PORT}`)
})

