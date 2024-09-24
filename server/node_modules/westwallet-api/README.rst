westwallet-js-api
=====================
.. image:: https://img.shields.io/npm/v/westwallet-api.svg?style=flat-square
    :alt: npm
    :target: https://www.npmjs.org/package/westwallet-api

westwallet-js-api is a `WestWallet Public API <https://westwallet.io/api_docs>`_ wrapper for JavaScript programming language. Use it for building payment solutions.

Installing
----------

Install from npm:

.. code-block:: text

    npm install westwallet-api


Create withdrawal example
-------------------------

.. code-block:: JavaScript

    // Sending 0.1 ETH to 0x57689002367b407f031f1BB5Ef2923F103015A32
    const westwallet = require('westwallet-api');
    const westwalletErrors = westwallet.WestWalletAPIErrors;

    let client = new westwallet.WestWalletAPI(
        "your_public_key",
        "your_private_key"
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


Generate address example
-------------------------

.. code-block:: JavaScript

    const westwallet = require('westwallet-api');
    const westwalletErrors = westwallet.WestWalletAPIErrors;

    let client = new westwallet.WestWalletAPI(
        "your_public_key",
        "your_private_key"
    );
    client.generateAddress("BTC").then((data) => {
        console.log(data);
    }).catch((error) => {
        if (error instanceof westwalletErrors.CurrencyNotFoundError) {
            console.log("No such currency");
        }
    });

Documentation
-------------
* API: https://westwallet.io/api_docs


Other languages
---------------
* Python: https://github.com/WestWallet/westwallet-python-api
* Golang: https://github.com/WestWallet/westwallet-golang-api
* PHP: https://github.com/WestWallet/westwallet-php-api
