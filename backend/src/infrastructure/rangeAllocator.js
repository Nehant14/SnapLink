const counter = require("../models/counter.model")

// We are using RangeAllocator to increase performace and also to Isolate each requrest so they should not interfere
// This is to conserver ACID property
// For more info or explaination you can read the last comments from start

const blockSize = 1000;

class rangeAllocator{

    constructor(BlockSize=blockSize){

        this.BlockSize = BlockSize;


        this.currentID = null;
        this.maxIdinBlock = null;


    }

    // below function doesn't return anything, it updates the class variables
    async reserveBlocks(){

        const result = await Counter.findOneAndUpdate(
            { _id: 'short_code' },
            { $inc: { current_max: this.blockSize } },
            { new: true, upsert: true }
            // new: true      -> return the document AFTER the update (Mongoose's
            //                    equivalent of the raw driver's returnDocument: 'after')
            // upsert: true   -> if the counter document doesn't exist yet, create it
            //                    (starting from current_max: 0, then incremented)
        );


        const newMax = result.current_max;

        this.maxIdinBlock = newMax;
        this.currentID = newMax - this.blockSize;
    }

    
    // its the max function
    async getNextId(){

        if(this.currentID == null || this.currentID >= this.maxIdinBlock){

            // if the above condition satisfies then we update the class variable to get the fresh new 1000 id blocks to use
            // we take 1000 fresh id black every time the currentID (which gets allocated) gets used (ex : 999 gets used and when it touch 1000, then maxIdBlock changes from 1000 to 2000 then currentId goes from 1000 to 1999 then when it becomes 2000 then new 1000 are allocated)
            // this is done to increase the performace as if we call db everytime for each call then it can reduce performace so we call it once and take 1000 ids at once
            await this.reserveBlocks();
        }

        // we return id and increment currentID for the next user
        const id = this.currentID;
        this.currentID++;

        return id;   
    }

}





// Option 1: Use MongoDB's own auto-generated _id

// Every Mongo document already gets a unique _id (an ObjectId) for free — no extra code needed. So why not just base62.encode() that?

// Problem: ObjectIds are 24-character hex strings (12 bytes), not small sequential integers. Base62-encoding a full ObjectId doesn't give you a short code — it gives you a long code, defeating the whole purpose of a URL shortener. You specifically want small numbers (0, 1, 2, 3...) so their base62 encoding stays short ("0", "1", "g8", etc.) for a long time before codes get longer.

// Option 2: Just read-then-increment a counter yourself (naive approach)
// javascript
// let counter = await getCounterFromDB();
// counter = counter + 1;
// await saveCounterToDB(counter);
// return counter;

// Problem: this is not atomic. If two requests run this at nearly the same time, both might read the same starting value before either writes the incremented one back — both requests could end up with the same number. That's the exact collision bug you're trying to avoid.

// This is fixable with MongoDB's $inc — that part alone (a single atomic increment, one at a time) would solve correctness. But then:

// Option 3: Atomic $inc by 1, called on every single request
// javascript
// const result = await Counter.findOneAndUpdate(
//     { _id: 'short_code' },
//     { $inc: { current_max: 1 } },
//     { new: true }
// );
// return result.current_max;

// This is correct — no collisions, ever, since $inc is atomic. So why not just do this?

// Problem: performance. Every single URL shortened now requires a network round-trip to MongoDB just to get a number, before you've even done the actual work of saving the URL. At high traffic (thousands of requests/second across multiple servers), this:

// adds latency to every request
// puts write pressure on a single hot document in Mongo, since literally every request everywhere is fighting to update the same one document, one at a time, serialized

// This is a genuine bottleneck at scale — you've turned "generate a short code" into "wait in line behind every other request in the world."

// Why RangeAllocator (block reservation) fixes this

// Instead of asking Mongo for one ID at a time, you ask for a batch of 1000 at once, then serve the next 999 requests entirely from local memory — zero DB calls, zero waiting in line with other servers. You only go back to Mongo once every 1000 requests, on that one server.

// This is a very well-known pattern (sometimes called a "hi-lo algorithm" in ID-generation contexts) precisely because it gets you:

// Correctness: still zero collisions, guaranteed by the same atomic $inc, just used less often
// Speed: 999 out of every 1000 ID requests are instant, in-memory, no network call
// Scalability: multiple servers can run in parallel without contention, because each only touches the shared counter rarely, and each grabs a distinct chunk when it does