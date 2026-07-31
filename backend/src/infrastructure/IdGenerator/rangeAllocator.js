const counter = require("../../models/counter.model")

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

module.exports = rangeAllocator;


