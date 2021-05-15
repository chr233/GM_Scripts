// ==UserScript==
// @name         Bear_Encode_Decode
// @namespace    https://blog.chrxw.com
// @version      0.1
// @description  兽音译者加解密库
// @author       sgdrg15rdg
// ==/UserScript==

const beastDictArr = ['嗷', '呜', '啊', '~'];

function bearEncode(rawStr) {
    let charArr = rawStr.split("");
    let unicodeHexStr = "";
    for (let i = 0; i < charArr.length; i++) {
        let charHexStr = charArr[i].charCodeAt(0).toString(16);
        while (charHexStr.length < 4) {
            charHexStr = "0" + charHexStr;
        }
        unicodeHexStr += charHexStr;
    }
    let k = 0;
    let unicodeHexStrArr = unicodeHexStr.split("");
    let beastStr = "";
    for (let i = 0; i < unicodeHexStrArr.length; i++) {
        let unicodeHexCharValue = parseInt("0x" + unicodeHexStrArr[i]);
        k = unicodeHexCharValue + (i % 0x10);
        if (k >= 0x10) {
            k = k - 0x10;
        }
        beastStr += beastDictArr[parseInt(k / 4)] + beastDictArr[(k % 4)];
    }
    return "~呜嗷" + beastStr + "啊";
}
function bearDecode(decoratedBeastStr) {
    let beastStr = decoratedBeastStr.substring(3, decoratedBeastStr.length - 1);
    let unicodeHexStr = "";
    let beastStrArr = beastStr.split("");
    for (let i = 0; i <= (beastStr.length - 2); i += 2) {
        let beastCharStr = "";
        let pos1 = 0;
        beastCharStr = beastStrArr[i];
        for (; pos1 <= 3; pos1++) {
            if (beastCharStr == beastDictArr[pos1]) {
                break;
            }
        }
        let pos2 = 0;
        beastCharStr = beastStrArr[i + 1];
        for (; pos2 <= 3; pos2++) {
            if (beastCharStr == beastDictArr[pos2]) {
                break;
            }
        }
        let k = (pos1 * 4) + pos2;
        let unicodeHexCharValue = k - (parseInt(i / 2) % 0x10);
        if (unicodeHexCharValue < 0) {
            unicodeHexCharValue += 0x10;
        }
        unicodeHexStr += unicodeHexCharValue.toString(16);
    }
    let rawStr = "";
    let start = 0;
    let end = 4;
    while (end <= unicodeHexStr.length) {
        let charHexStr = unicodeHexStr.substring(start, end);
        let charStr = String.fromCharCode(parseInt("0x" + charHexStr));
        rawStr += charStr;
        start += 4;
        end += 4;
    }
    return rawStr;
}

