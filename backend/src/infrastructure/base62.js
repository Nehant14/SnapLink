

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";


// you may think that as we want to encrypt the url which contain number + alphabet and many things then
// then how this encoder that only encodes the numericID only will work
// answer is that when we store the original link in database, the database gives us a numericID for the original link
// we encode that numericID and then decode it to search that index to get the original link


function encode(numericID){

    let ans = "";
    while(numericID > 0){
        
        let remainder = numericID % 62;
        ans = BASE62[remainder] + ans;    // I want to add the new letter to the start not end so I didn't do ans += Base62[remainder]

        numericID = Math.floor(numericID/62);
    }

    return ans;
}


function decode(shortCode){

    let ans = 0;
    for(let i = 0; i < shortCode.length; i++){

        const c = shortCode[i];
        const val = BASE62.indexOf(c);

        ans = ans * 62 + val;
        
    }

    return ans;
}


module.exports = {encode, decode};