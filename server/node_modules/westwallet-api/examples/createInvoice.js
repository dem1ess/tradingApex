const westwallet = require('../index');
const config = require('./config');

let client = new westwallet.WestWalletAPI(
    config.config.apiKey, 
    config.config.secretKey, 
    config.config.baseUrl
);

// Create BTC/ETH invoice for amount of 10 USD in equivalent and https://someipn.com as IPN for generated addresses
client.createInvoice(["BTC", "ETH"], "10", true, "https://someipn.com")
.then((data) => {
    console.log(data);
}).catch((error) => {
    console.log(error);
});
