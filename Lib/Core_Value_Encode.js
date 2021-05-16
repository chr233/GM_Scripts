// ==UserScript==
// @name         Core_Value_Encode
// @namespace    https://blog.chrxw.com
// @version      0.1
// @description  核心价值观编码器,来自https://github.com/sym233/core-values-encoder
// @author       sym233
// ==/UserScript==

function assert(...express) {
    for (let b of express) {
        if (!b) { throw new Error(msg); }
    }
}
function randBin() {
    return Math.random() >= 0.5;
}
const values = '富强民主文明和谐自由平等公正法治爱国敬业诚信友善';
function str2utf8(str) {
    // return in hex
    const notEncoded = /[A-Za-z0-9\-\_\.\!\~\*\'\(\)]/g;
    const str1 = str.replace(notEncoded, c => c.codePointAt(0).toString(16));
    let str2 = encodeURIComponent(str1);
    const concated = str2.replace(/%/g, '').toUpperCase();
    return concated;
}
function utf82str(utfs) {
    assert(typeof utfs === 'string');
    const l = utfs.length;
    assert((l & 1) === 0);
    const splited = [];
    for (let i = 0; i < l; i++) {
        if ((i & 1) === 0) {
            splited.push('%');
        }
        splited.push(utfs[i]);
    }

    return decodeURIComponent(splited.join(''));
}
function hex2duo(hexs) {
    // duodecimal in array of number

    // '0'.. '9' -> 0.. 9
    // 'A'.. 'F' -> 10, c - 10    a2fFlag = 10
    //          or 11, c - 6      a2fFlag = 11
    assert(typeof hexs === 'string')
    const duo = [];
    for (let c of hexs) {
        const n = Number.parseInt(c, 16);
        if (n < 10) {
            duo.push(n);
        } else {
            if (randBin()) {
                duo.push(10);
                duo.push(n - 10);
            } else {
                duo.push(11);
                duo.push(n - 6);
            }
        }
    }
    return duo;
}
function duo2hex(duo) {
    assert(duo instanceof Array);
    const hex = [];
    const l = duo.length;
    let i = 0;
    while (i < l) {
        if (duo[i] < 10) {
            hex.push(duo[i]);
        } else {
            if (duo[i] === 10) {
                i++;
                hex.push(duo[i] + 10);
            } else {
                i++;
                hex.push(duo[i] + 6);
            }
        }
        i++;
    }
    return hex.map(v => v.toString(16).toUpperCase()).join('');
}
function duo2values(duo) {
    return duo.map(d => values[2 * d] + values[2 * d + 1]).join('');
}
function valuesDecode(encoded) {
    const duo = [];
    try {
        for (let c of encoded) {
            const i = values.indexOf(c);
            if (i === -1) {
                continue;
            } else if (i & 1) {
                continue;
            } else {
                // i is even
                duo.push(i >> 1);
            }
        }
        const hexs = duo2hex(duo);
        assert((hexs.length & 1) === 0);
        let str;
        try {
            str = utf82str(hexs);
        } catch (e) {
            throw e;
        }
        return str;
    } catch (e) {
        console.error(e)
        return '**解码出错**';
    }
}
function valuesEncode(str) {
    try {
        return duo2values(hex2duo(str2utf8(str)));
    } catch (e) {
        console.error(e)
        return '**编码出错**';
    }
}
