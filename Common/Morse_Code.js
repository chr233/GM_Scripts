// ==UserScript==
// @name         Morse_Code
// @namespace    https://blog.chrxw.com
// @version      0.5
// @description  摩尔斯电码库,来自https://github.com/hustcc/xmorse
// @author       hustcc
// ==/UserScript==

const STANDARD = {
    A: '01', B: '1000', C: '1010', D: '100', E: '0', F: '0010', G: '110', H: '0000', I: '00',
    J: '0111', K: '101', L: '0100', M: '11', N: '10', O: '111', P: '0110', Q: '1101', R: '010',
    S: '000', T: '1', U: '001', V: '0001', W: '011', X: '1001', Y: '1011', Z: '1100',

    '0': '11111', '1': '01111', '2': '00111', '3': '00011', '4': '00001', '5': '00000', '6': '10000',
    '7': '11000', '8': '11100', '9': '11110', '.': '010101', ',': '110011', '?': '001100', "'": '011110',
    '!': '101011', '/': '10010', '(': '10110', ')': '101101', '&': '01000', ':': '111000', ';': '101010',
    '=': '10001', '+': '01010', '-': '100001', _: '001101', '"': '010010', $: '0001001', '@': '011010',
};
const REVERSED_STANDARD = reverseStandard(STANDARD);

const SHORT = '.';
const LONG = '-';
const SPACE = '/';
// to hex
function unicodeHexMorse(ch) {
    const r = [];
    for (var i = 0; i < ch.length; i++) {
        r[i] = ('00' + ch.charCodeAt(i).toString(16)).slice(-4);
    }
    let s = r.join(''); // unicode 值
    s = parseInt(s, 16).toString(2); // 转二进制
    return s;
}

function morseEncode(msg) {
    // 删除空格，转大写，分割为数组
    const text = msg.replace(/\s+/g, '').toLocaleUpperCase().split('');

    return text.map((ch) => {
        let r = STANDARD[ch];
        if (!r) {
            r = unicodeHexMorse(ch); // 找不到，说明是非标准的字符，使用 unicode。
        }
        return r.replace(/0/g, SHORT).replace(/1/g, LONG);
    }).join(SPACE);
}

function morseHexUnicode(mor) {
    mor = parseInt(mor, 2); // 解析 2 进制数
    if (isNaN(mor)) return ''; // 解析失败，直接返回空字符串跳过
    return unescape('%u' + mor.toString(16)); // 转 16 进制 -> unicode -> unicode 转字符串
}

function morseDecode(morse) {
    return morse.split(SPACE).map((mor) => {
        const m = mor.replace(/\s+/g, '') // 去除空格
            .replace(new RegExp('\\' + SHORT, 'g'), '0').replace(new RegExp('\\' + LONG, 'g'), '1'); // 转二进制;
        let r = REVERSED_STANDARD[m];
        if (!r) r = morseHexUnicode(m); // 找不到，说明是非标准字符的 morse，使用 unicode 解析方式。
        return r;
    }).join('');
}
function reverseStandard(standard) {
    const reversed = {};
    for (const key in standard) {
        reversed[standard[key]] = key;
    }
    return reversed;
}