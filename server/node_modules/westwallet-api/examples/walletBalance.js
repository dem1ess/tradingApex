const westwallet = require('../index');
const westwalletErrors = require('../lib/errors');
const config = require('./config');

let client = new westwallet.WestWalletAPI(
    config.config.apiKey, 
    config.config.secretKey, 
    config.config.baseUrl
);
client.walletBalance("BTC").then((data) => {
    console.log(data);
}).catch((error) => {
    if (error instanceof westwalletErrors.CurrencyNotFoundError) {
        console.log("No such currency");
    }
});
