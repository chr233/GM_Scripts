// ==UserScript==
// @name         Basic_Cryto
// @namespace    https://blog.chrxw.com
// @version      0.4
// @description  Base64加解密库
// @require      https://cdn.bootcdn.net/ajax/libs/crypto-js/4.0.0/crypto-js.min.js
// @author       Chr_
// ==/UserScript==


// Base64编码(调用Crypto-js)
function base64Encode(words) {
    'use strict';
    try {
        words = CryptoJS.enc.Utf8.parse(words);
        let enc = CryptoJS.enc.Base64.stringify(words);
        return enc;
    } catch (e) {
        console.error(e);
        return '**编码失败**';
    }
}

// Base64解码(调用Crypto-js)
function base64Decode(enc) {
    'use strict';
    try {

        // var parsedWordArray = CryptoJS.enc.Base64.parse(base64);
        // var parsedStr = parsedWordArray.toString(CryptoJS.enc.Utf8);

        let words = CryptoJS.enc.Base64.parse(enc);
        var plain = words.toString(CryptoJS.enc.Utf8);//CryptoJS.enc.Utf8.stringify(words); // 'Hello world'
        return plain;
    } catch (e) {
        console.error(e);
        return '**解码失败**';
    }
}
