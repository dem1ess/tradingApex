class WestWalletAPIError extends Error {
       
}

class InsufficientFundsError extends WestWalletAPIError {

}

class CurrencyNotFoundError extends WestWalletAPIError {

}

class NotAllowedError extends WestWalletAPIError {
    // Raises when request type or headers don't match API key settings
}


class WrongCredentialsError extends WestWalletAPIError {
    // Raises when you've provided wrong API key
}


class TransactionNotFoundError extends WestWalletAPIError {

}


class AccountBlockedError extends WestWalletAPIError {
    // Raises if your account unable to create withdrawal
}


class BadAddressError extends WestWalletAPIError {
    // Raises when WestWallet server regex check of recipient's address fails
}


class BadDestTagError extends WestWalletAPIError {
    // Raises when WestWallet server regex check of recipient's destination tag fails
}


class MinWithdrawError extends WestWalletAPIError {

}


class MaxWithdrawError extends WestWalletAPIError {

}

const errorsMap = {
    "account_blocked": AccountBlockedError,
    "bad_address": BadAddressError,
    "bad_dest_tag": BadDestTagError,
    "insufficient_funds": InsufficientFundsError,
    "max_withdraw_error": MaxWithdrawError,
    "min_withdraw_error": MinWithdrawError,
    "currency_not_found": CurrencyNotFoundError,
    "not_found": TransactionNotFoundError
}

module.exports = {
    WestWalletAPIError: WestWalletAPIError,
    InsufficientFundsError: InsufficientFundsError,
    CurrencyNotFoundError: CurrencyNotFoundError,
    NotAllowedError: NotAllowedError,
    WrongCredentialsError: WrongCredentialsError,
    TransactionNotFoundError: TransactionNotFoundError,
    AccountBlockedError: AccountBlockedError,
    BadAddressError: BadAddressError,
    BadDestTagError: BadDestTagError,
    MinWithdrawError: MinWithdrawError,
    MaxWithdrawError: MaxWithdrawError,
    errorsMap: errorsMap
};