const westwallet = require('../index');
const westwalletErrors = require('../lib/errors');
const config = require('./config');

let client = new westwallet.WestWalletAPI(
    config.config.apiKey, 
    config.config.secretKey, 
    config.config.baseUrl
);
client.createWithdrawal("ETH", "0.1", "0x57689002367b407f031f1BB5Ef2923F103015A32")
.then((data) => {
    console.log(data);
}).catch((error) => {
    if (error instanceof westwalletErrors.InsufficientFundsError) {
        console.log("Insufficient funds");
    } else if (error instanceof westwalletErrors.BadAddressError) {
        console.log("Bad address regex");
    } else {
        console.log(error);
    }
});
