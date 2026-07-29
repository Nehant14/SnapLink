

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";


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