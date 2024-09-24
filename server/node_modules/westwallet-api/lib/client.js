const axios = require('axios');
const querystring = require("querystring");
const crypto = require('crypto');
const util = require('util');
const errors = require('./errors.js');

class WestWalletAPI {

  constructor(apiKey, secretKey, baseUrl="https://api.westwallet.io") {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  _makePostRequest(methodUrl, data) {
    return axios({
      url: util.format('%s%s', this.baseUrl, methodUrl), 
      method: 'POST',
      data: data, 
      headers: this._makeHeaders(data)
    }).then((response) => {
      this._checkErrors(response);
      return response.data
    });
  }

  _makeGetRequest(methodUrl, params) {
    return axios({
      url: util.format('%s%s', this.baseUrl, methodUrl), 
      method: 'GET',
      params: params,
      headers: this._makeHeaders(params)
    }).then((response) => {
      this._checkErrors(response);
      return response.data
    })
  }

  _makeHeaders(data) {
    var timestamp = Math.floor(Date.now() / 1000);
    if (Object.keys(data).length === 0) {
      data = ""
    } else {
      data = JSON.stringify(data)
    }
    var message = util.format("%s%s", timestamp, data);
    var sign = crypto.createHmac('sha256', this.secretKey).update(message).digest('hex');
    var headers = {
      "X-API-KEY": this.apiKey,
      "X-ACCESS-SIGN": sign,
      "X-ACCESS-TIMESTAMP": timestamp
    };
    return headers;
  }

  _checkErrors(response) {
    if (response.status == 401) {
      throw new errors.WrongCredentialsException;
    }
    if (response.status == 403) {
      throw new errors.NotAllowedException;
    }
    const responseJson = response.data;
    if (responseJson.error != "ok") {
      const exception = new errors.errorsMap[responseJson.error];
      if (exception) {
        throw exception;
      }
      throw new errors.WestWalletAPIError(responseJson.error);
    }
  }

  walletBalance(currency) {
    const methodUrl = "/wallet/balance";
    return this._makeGetRequest(methodUrl, {
      currency: currency
    })
  }

  walletBalances() {
    const methodUrl = "/wallet/balances";
    return this._makeGetRequest(methodUrl, {});
  }

  createWithdrawal(currency, amount, address, destTag = "", description = "") {
    const methodUrl = "/wallet/create_withdrawal";
    const data = {
      currency: currency,
      amount: amount,
      address: address,
      dest_tag: destTag,
      description: description
    };
    return this._makePostRequest(methodUrl, data);
  }

  transactionInfo(id) {
    const methodUrl = "/wallet/transaction";
    const data = {
      id: id
    };
    return this._makePostRequest(methodUrl, data);
  }

  generateAddress(currency, ipnUrl = "", label = "") {
    const methodUrl = "/address/generate";
    const data = {
      currency: currency,
      ipn_url: ipnUrl,
      label: label
    };
    return this._makePostRequest(methodUrl, data);
  }

  createInvoice(currencies, amount, amountInUsd, ipnUrl, successUrl = undefined, description = undefined, label = undefined, ttl = 15)  {
    const methodUrl = "/address/create_invoice";
    const data = {
      currencies: currencies,
      amount: amount,
      amount_in_usd: amountInUsd,
      ipn_url: ipnUrl,
      success_url: successUrl,
      description: description,
      label: label,
      ttl: ttl
    };
    return this._makePostRequest(methodUrl, data);
  }
}

module.exports = exports = WestWalletAPI;
