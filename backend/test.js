const Config = require("./utils/config");

const faucetPublicKey = Config.faucetPublicKey;
const newDate = new Date().toISOString();

console.log(faucetPublicKey);
console.log(newDate);
