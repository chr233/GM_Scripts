// ==UserScript==
// @name         Steam_Commit_Crypto
// @name:zh-CN   STEAM评测加密解密助手
// @namespace    https://blog.chrxw.com
// @version      0.9
// @description  快速加解密评测文本
// @description:zh-CN  快速加解密评测文本
// @author       Chr_
// @include      /https://store\.steampowered\.com?/*.
// @include      /https://steamcommunity\.com?/*.
// @require      https://cdn.jsdelivr.net/gh/chr233/GM_Scripts@65475a39f3a5cef38f90b5ac29c560a4fdaee65d/Lib/Bear_Encode_Decode.js
// @require      https://cdn.jsdelivr.net/gh/chr233/GM_Scripts@65475a39f3a5cef38f90b5ac29c560a4fdaee65d/Lib/Basic_Crypto.js
// @require      https://cdn.jsdelivr.net/gh/chr233/GM_Scripts@65475a39f3a5cef38f90b5ac29c560a4fdaee65d/Lib/Morse_Code.js?
// @require      https://cdn.bootcdn.net/ajax/libs/crypto-js/4.0.0/crypto-js.min.js
// @require      https://cdn.jsdelivr.net/gh/chr233/GM_Scripts@65475a39f3a5cef38f90b5ac29c560a4fdaee65d/Lib/Core_Value_Encode.js
// @connect      steamcommunity.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// ==/UserScript==

let G_ver = '0.9';     // 版本号

let G_CMode = 'syyz';  // 加密解密模式

const CryptoMode = {   // 加解密模式
    // 'auto': ['自动猜测(非万能)', null, null],
    'syyz': ['兽音译者', '兽音', bearEncode, bearDecode, '核心代码来自  https://github.com/sgdrg15rdg/beast_js'],
    // 'yflc': ['与佛论禅(在线)', '佛曰', yflcEncode, yflcDncode, '调用在线API  http://hi.pcmoe.net/buddha.html'],
    'shzy': ['核心价值观', '价值', valuesEncode, valuesDecode, '核心代码来自  https://github.com/sym233/core-values-encoder'],
    'bs64': ['Base64', 'B64', base64Encode, base64Decode, '基于 Crypto JS'],
    'msdm': ['摩尔斯电码', '摩尔斯', morseEncode, morseDecode, '核心代码来自 https://github.com/hustcc/xmorse'],
};

const ValidElemtents = [ // 有效元素过滤器
    ['class', 'content'],
    ['id', 'ReviewText'],
    ['class', 'input_box'],
];

window.addEventListener('load', () => {
    'use strict';

    if (self != top && document.documentElement.scrollHeight < 200) {// 位于iframe中,不执行脚本
        return;
    }

    addPanel();

    window.addEventListener('mouseup', handleMouseUpEvent);
    window.addEventListener('mousedown', handleMouseDownEvent);

    let bar = document.getElementById('sccTips');
    bar.style.visibility = 'hidden';
});

// 添加GUI
function addPanel() {
    function genButton(text, foo, id) {
        let b = document.createElement('button');
        b.textContent = text;
        b.style.cssText = 'vertical-align: inherit;padding: 0 5px;height: 24px;';
        b.addEventListener('click', foo);
        if (id) { b.id = id; }
        return b;
    }
    function genDiv(id) {
        let d = document.createElement('div');
        // d.style.cssText = 'vertical-align:middle;';
        if (id) { d.id = id; };
        return d;
    }
    function genPanel(name, visiable) {
        let d = genDiv(name);
        d.style.cssText = 'background: rgba(58, 58, 58, 0.9);position: fixed;top: 50%;';
        d.style.cssText += 'text-align: center;transform: translate(0px, -50%);z-index: 1000;';
        d.style.cssText += 'border: 1px solid rgb(83, 83, 83);padding: 5px;';
        d.style.cssText += 'transition:right 0.8s;right:-350px;width:310px;font-size:14px;';
        if (visiable) {
            d.style.right = '0';
        }
        return d;
    }
    function genPanel2(name, visiable) {
        let d = genDiv(name);
        d.style.cssText = 'background: rgba(58, 58, 58, 0.9);position: fixed;';
        d.style.cssText += 'text-align: center;transform: translate(0px, -50%);z-index: 2000;';
        d.style.cssText += 'border: 1px solid rgb(83, 83, 83);padding: 2px;visibility: none';
        d.style.cssText += 'transition:visiable 0.8s;font-size:14px;';
        if (visiable) {
            d.style.visibility = 'visible';
        }
        return d;
    }
    function genLabel(text, bind) {
        let l = document.createElement('label');
        l.textContent = text;
        l.style.verticalAlign = 'inherit';
        if (bind) { l.setAttribute('for', bind); }
        return l;
    }
    function genA(text, url) {
        let a = document.createElement('a');
        a.textContent = text;
        a.href = url;
        return a;
    }
    function genSelect(id, choose, choice) {
        let s = document.createElement('select');
        s.id = id;
        s.style.cssText = 'color:#000;background:#fff;border:none;border-radius:0;vertical-align:inherit;width: 70%;height: 22px;';
        for (k in choose) {
            s.options.add(new Option(choose[k][0], k));
        }
        s.value = choice;
        for (let i = 0; i < s.childElementCount; i++) {
            s.children[i].style.background = '#fff';
        }
        return s;
    }
    function genSelect2(id) {
        let s = document.createElement('select');
        s.id = id;
        s.style.cssText = 'color:#000;background:#fff;border:none;border-radius:0;padding: 2px 0;margin: 0 2px;height: 22px;width: 50px;';
        s.options.add(new Option('解密', 'decode', true));
        s.options.add(new Option('加密', 'encode'));
        for (let i = 0; i < s.childElementCount; i++) {
            s.children[i].style.background = '#fff';
        }
        return s;
    }
    function genSpace() {
        let s = document.createElement('span');
        s.textContent = '    ';
        return s;
    }
    function genBr() {
        return document.createElement('br');
    }
    function genHr() {
        let h = document.createElement('hr');
        h.style.margin = '2px 0';
        return h;
    }
    function genTextArea(id, tips) {
        let t = document.createElement('textarea');
        if (id) { t.id = id; }
        if (tips) { t.placeholder = tips; }
        t.style.cssText = 'width: 98%;height: 100px;resize: vertical;font-size: 12px;';
        t.style.cssText += 'max-height:500px;background-color: #fff;padding: 2px;';
        return t;
    }

    let panelFunc = genPanel('sccCtrl', false);
    document.body.appendChild(panelFunc);

    let divTitle = genDiv();
    divTitle.style.marginBottom = '5px';
    let lblTitle = genLabel(`SCC - V ${G_ver} - By `, null);
    let lblUrl = genA('Chr_', 'https://steamcommunity.com/id/Chr_');
    let lblFeed = genA('[反馈]', 'https://blog.chrxw.com/scripts.html');
    let btnClose = genButton('关闭', () => { switchPanel(false); }, 'btnClose');
    btnClose.style.float = 'left';

    divTitle.appendChild(lblTitle);
    divTitle.appendChild(lblUrl);
    divTitle.appendChild(genSpace());
    divTitle.appendChild(lblFeed);
    divTitle.appendChild(btnClose);

    let txtInput = genTextArea('txtInput', '在这里输入密文');

    let divMode = genDiv();
    let lblMode = genLabel('模式：', 'lblMode');
    let selMode = genSelect('selMode', CryptoMode, G_CMode);
    let btnHelp = genButton('?', showHelp, 'btnHelp');

    divMode.style.marginBottom = '5px';
    divMode.appendChild(lblMode);
    divMode.appendChild(selMode);
    divMode.appendChild(genSpace());
    divMode.appendChild(btnHelp);

    let divAction = genDiv();
    let btnDecode = genButton('解密↓', decode, 'btnDecode');
    let btnEncode = genButton('加密↑', encode, 'btnEncode');
    let btnExchange = genButton('交换↕', exchange, 'btnExchange');
    let btnCopyTxt = genButton('复制原文', copyTxt, 'btnCopyTxt');
    let btnCopyEnc = genButton('复制密文', copyEnc, 'btnCopyEnc');
    // let btnExtract = genButton('提取链接🌐', null, 'btnExchange');

    divAction.style.marginBottom = '5px';
    divAction.appendChild(btnDecode);
    divAction.appendChild(genSpace());
    divAction.appendChild(btnEncode);
    divAction.appendChild(genSpace());
    divAction.appendChild(btnExchange);
    divAction.appendChild(genSpace());
    divAction.appendChild(btnCopyTxt);
    divAction.appendChild(genSpace());
    divAction.appendChild(btnCopyEnc);
    // divAction.appendChild(genSpace());
    // divAction.appendChild(btnExtract);

    let txtOutput = genTextArea('txtOutput', '在这里输入明文');

    panelFunc.appendChild(divTitle);
    panelFunc.appendChild(txtInput);
    panelFunc.appendChild(divMode);
    panelFunc.appendChild(divAction);
    panelFunc.appendChild(txtOutput);


    let panelTips = genPanel2('sccTips', false);
    document.body.appendChild(panelTips);
    let selBar = genSelect2('selBar');
    panelTips.appendChild(selBar);

    for (let key in CryptoMode) {
        let name = CryptoMode[key][1];
        let btnFunc = genButton(name, () => { toolbarCallback(`${key}`); }, `btn${key}`);
        panelTips.appendChild(btnFunc);
    }
}

// 加密
function encode() {
    let m = document.getElementById('selMode');
    let i = document.getElementById('txtInput');
    let o = document.getElementById('txtOutput');
    let obj = CryptoMode[m.value][2];
    i.value = obj(o.value);
}
// 解密
function decode() {
    let m = document.getElementById('selMode');
    let i = document.getElementById('txtInput');
    let o = document.getElementById('txtOutput');
    let obj = CryptoMode[m.value][3];
    o.value = obj(i.value);
}
// 交换明文密文
function exchange() {
    let i = document.getElementById('txtInput');
    let o = document.getElementById('txtOutput');
    [i.value, o.value] = [o.value, i.value];
}

// 鼠标松开事件(显示工具栏)
function handleMouseUpEvent(event) {
    setTimeout(() => {
        let ele = event.target;
        let str = window.getSelection().toString();
        let bar = document.getElementById('sccTips');

        if (str == "") { // 未选择文本,终止
            return;
        }

        // 判断选中的文字是否处于特定的元素中
        for (let [key, value] of ValidElemtents) {
            let obj = ele.getAttribute(key);
            if (obj && obj.toString().indexOf(value) != -1) {
                console.log(str);
                console.log(key, value);
                let x, y;
                x = event.clientX + 15;
                y = event.clientY - 15;
                bar.style.left = `${x}px`;
                bar.style.top = `${y}px`;
                bar.style.visibility = 'visible';
                break;
            }
        }
    }, 200);
}
// 鼠标按下事件(隐藏工具栏)
function handleMouseDownEvent(event) {
    let ele = event.target;

    if (ele.parentElement.id != 'sccTips') {

        let bar = document.getElementById('sccTips');
        if (bar.style.visibility != 'hidden') {
            bar.style.visibility = 'hidden';
        }
    }

}

// 工具栏回调
function toolbarCallback(mode) {
    let m = document.getElementById('selMode');
    let bm = document.getElementById('selBar');
    let i = document.getElementById('txtInput');
    let o = document.getElementById('txtOutput');
    let b = document.getElementById('sccTips');
    let str = window.getSelection().toString();
    b.style.visibility = 'hidden';
    switchPanel(true);
    m.value = mode;

    if (bm.value == 'encode') {
        o.value = str;
        encode();
    } else {
        i.value = str;
        decode();
    }
}

// 显示/隐藏面板
function switchPanel(mode) {
    let p = document.getElementById('sccCtrl');

    if (mode === null) {
        if (p.style.right == '-350px') {
            p.style.right = '0';
        } else {
            p.style.right = '-350px';
        }
    } else {
        p.style.right = mode ? '0' : '-350px';
    }
}

// 显示编码器信息
function showHelp() {
    let m = document.getElementById('selMode');
    let msg = CryptoMode[m.value][4];
    ShowAlertDialog('编码器信息', msg);
}

// 复制原文
function copyTxt() {
    let o = document.getElementById('txtOutput');
    GM_setClipboard(o.value, { type: 'text', mimetype: 'text/plain' });
}

// 复制密文
function copyEnc() {
    let i = document.getElementById('txtInput');
    GM_setClipboard(i.value, { type: 'text', mimetype: 'text/plain' });
}