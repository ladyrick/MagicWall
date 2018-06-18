// copy this file and rename it to "config.js" if you need some private config.


var mainnet = {
    callbackURL: "https://mainnet.nebulas.io",
    chainID: 1
}
var testnet = {
    callbackURL: "https://testnet.nebulas.io",
    chainID: 1001
}
var localnet = {
    callbackURL: "http://127.0.0.1:8685",
    chainID: 100
}

// netConfig: the Nebulas Net Config.
// you can use the preset config, or you can config on your own.
var netConfig = mainnet;
// var netConfig = testnet;
// var netConfig = localnet;
// var netConfig = {
//     callbackURL: "http://remoteurl:8685",
//     chainID: 100
// }


// contract address.
// mainnet contract address.
var contractAddress = "n1ftx4V2q9zrRZGp2ZXtjybFYToZjrJhMUK";