// ==UserScript==
// @name         Steam_Commit_Crypto
// @namespace    https://blog.chrxw.com
// @version      0.1
// @description  STEAM评测加密解密助手
// @author       Chr_
// @include      /https://(store\.steampowered|steamcommunity)\.com?/*.
// @require      https://greasyfork.org/scripts/426509-bear-encode-decode/code/Bear_Encode_Decode.js
// @require      https://cdn.jsdelivr.net/npm/js-base64@3.6.0/base64.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/crypto-js/4.0.0/core.min.js
// @connect      steamcommunity.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// ==/UserScript==

let G_ver = '0.1';     // 版本号

let G_CMode = 'syyz';  // 加密解密模式


let G_str = '';

const CryptoMode = {   // 加解密模式
    // 'auto': ['自动猜测(非万能)', null, null],
    'syyz': ['兽音译者', bearEncode, bearDecode],
    // 'msdm': ['摩斯电码', null, null],
    // 'xfy': ['佛曰', null, null],
    // 'rcnb': ['RCNB', null, null],
    // 'bs64': ['Base64', null, null],
};

const ValidElemtents = [
    ['class', 'content'],
    ['class', 'input_box']
];


(() => {
    'use strict';

    // if (self != top) {// 位于iframe中,不执行脚本
    //     return;
    // }

    addPanel();

    window.addEventListener('mouseup', handleMouseUpEvent);
    window.addEventListener('mousedown', handleMouseDownEvent);


})();

// 添加GUI
function addPanel() {
    function genButton(text, foo, id) {
        let b = document.createElement('button');
        b.textContent = text;
        b.style.cssText = 'vertical-align: inherit;padding: 0 5px;'
        b.addEventListener('click', foo);
        if (id) { b.id = id; }
        return b;
    }
    function genDiv(id) {
        let d = document.createElement('div');
        // d.style.cssText = 'vertical-align:middle;';
        if (id) { d.id = id };
        return d;
    }
    function genPanel(name, visiable) {
        let d = genDiv(name);
        d.style.cssText = 'background: rgba(58, 58, 58, 0.9);position: fixed;top: 50%;';
        d.style.cssText += 'text-align: center;transform: translate(0px, -50%);z-index: 1000;';
        d.style.cssText += 'border: 1px solid rgb(83, 83, 83);padding: 5px;';
        d.style.cssText += 'transition:right 0.8s;right:-300px;width:280px;font-size:14px;'
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
        d.style.cssText += 'transition:visiable 0.8s;font-size:14px;'
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
        s.style.cssText = 'color:#000;background:#fff;border:none;border-radius:0;vertical-align:inherit;width: 70%;';
        for (k in choose) {
            s.options.add(new Option(choose[k][0], k));
        }
        s.value = choice;
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
    divTitle.style.marginBottom = '5px'
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

    divMode.style.marginBottom = '5px'
    divMode.appendChild(lblMode);
    divMode.appendChild(selMode);

    let divAction = genDiv()
    let btnEncode = genButton('加密↑', encode, 'btnEncode');
    let btnDecode = genButton('解密↓', decode, 'btnDecode');
    let btnExchange = genButton('交换↕', exchange, 'btnExchange');
    // let btnExtract = genButton('提取链接🌐', null, 'btnExchange');

    divAction.style.marginBottom = '5px'
    divAction.appendChild(btnEncode);
    divAction.appendChild(genSpace());
    divAction.appendChild(btnDecode);
    divAction.appendChild(genSpace());
    divAction.appendChild(btnExchange);
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

    let btnSyyzD = genButton('兽音解密', () => { toolbarCallback('syyz_d'); }, 'btnSyyzD');
    let btnSyyzE = genButton('兽音加密', () => { toolbarCallback('syyz_e'); }, 'btnSyyzE');

    panelTips.appendChild(btnSyyzD);
    panelTips.appendChild(btnSyyzE);


}

// 加密
function encode() {
    let m = document.getElementById('selMode');
    let i = document.getElementById('txtInput');
    let o = document.getElementById('txtOutput');
    let obj = CryptoMode[m.value][1];
    i.value = obj(o.value);
}
// 解密
function decode() {
    let m = document.getElementById('selMode');
    let i = document.getElementById('txtInput');
    let o = document.getElementById('txtOutput');
    let obj = CryptoMode[m.value][2];
    o.value = obj(i.value);
}
// 交换明文密文
function exchange() {
    let i = document.getElementById('txtInput');
    let o = document.getElementById('txtOutput');
    [i.value, o.value] = [o.value, i.value];
}
// 选中文本显示工具栏
function showDialog(event) {
    let x = event.clientX;
    let y = event.clientY;
    console.log(x, y)
    console.log(window.getSelection().toString());
}
// 隐藏工具栏
function hideDialog(event) {
    let x = event.clientX;
    let y = event.clientY;
    console.log(x, y)
    console.log(window.getSelection().toString());
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
        G_str = str;

        // 判断选中的文字是否处于特定的元素中
        for (let [key, value] of ValidElemtents) {
            let obj = ele.getAttribute(key);
            if (obj && obj.toString().indexOf(value) != -1) {
                console.log(G_str);
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
    }, 500);
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
    let i = document.getElementById('txtInput');
    let o = document.getElementById('txtOutput');
    let b = document.getElementById('sccTips');
    b.style.visibility = 'hidden';
    switchPanel(true);
    i.value = G_str;
    o.value = G_str;
    m.value = mode.substr(0, mode.length - 2);

    switch (mode.substr(mode.length - 1)) {
        case 'd':
            decode();
            break;
        case 'e':
            encode();
            break;
        default:
            break;
    }
}

// 显示/隐藏面板
function switchPanel(mode) {
    let p = document.getElementById('sccCtrl');

    if (mode === null) {
        if (p.style.right == '-300px') {
            p.style.right = '0';
        } else {
            p.style.right = '-300px';
        }
    } else {
        p.style.right = mode ? '0' : '-300px';
    }
}