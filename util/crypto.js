const CryptoJS = require('crypto-js');

function passwordHash(password) {
    return CryptoJS.SHA512(CryptoJS.SHA512(password)+"NICP_FE_SALT_VVxETKJy7bjDtLa83ECG").toString();
}
exports.passwordHash = passwordHash;