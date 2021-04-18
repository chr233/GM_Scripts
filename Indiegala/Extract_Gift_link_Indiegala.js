// ==UserScript==
// @name         Extract_Gift_link_Indiegala
// @namespace    https://blog.chrxw.com/
// @version      0.1
// @description  Indiegala礼物链接提取
// @author       Chr_
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @match        https://www.indiegala.com/library
// @require      https://cdn.bootcdn.net/ajax/libs/clipboard.js/2.0.8/clipboard.min.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    addbtn();
    let clipboard = new ClipboardJS('#btnCopy', {
        target: function () {
            return document.getElementById('extractLinks');
        }
    });
})();

function addbtn() {
    'use strict';
    let area = document.querySelector("div.profile-private-page-user");
    let dv1 = document.createElement('div');
    let dv2 = document.createElement('div');
    let btn1 = document.createElement('button');
    let btn2 = document.createElement('button');
    let btn3 = document.createElement('button');
    let txt = document.createElement('textarea');
    dv1.style.cssText = 'margin: 12px 0;display: flex;';
    dv2.style.cssText = 'margin: 0 12px;display: block;';
    btn1.addEventListener('click', extract);
    btn2.addEventListener('click', copy);
    btn3.addEventListener('click', clear);
    btn1.style.cssText = 'display: inherit;';
    btn3.style.cssText = 'float: right;';
    btn1.textContent = '提取礼物链接';
    btn2.textContent = '复制';
    btn3.textContent = '×';
    btn2.id = 'btnCopy';
    txt.style.cssText = 'width: 70%;white-space: nowrap;overflow: scroll;';
    txt.id = 'extractLinks';
    dv2.appendChild(btn1);
    dv2.appendChild(btn2);
    dv2.appendChild(btn3);
    dv1.appendChild(dv2);
    dv1.appendChild(txt);
    area.appendChild(dv1);
}

function extract() {
    'use strict';
    let txt = document.getElementById('extractLinks');
    let btn2 = document.getElementById('btnCopy');
    let gifts = document.querySelectorAll('div.profile-private-page-library-gifts div.profile-private-page-library-gift-title > div.overflow-auto');
    if (gifts != null) {
        let list = [];
        let old = txt.value;
        for (let gift of gifts) {
            let giftLink = gift.querySelector('a').href;
            let giftPass = gift.querySelector('div:last-child>span').textContent;
            if (old.indexOf(giftLink.substring(38,)) >= 0) {
                console.log(`重复的礼物链接${giftLink.substring(38,)}`);
                continue;
            }
            list.push(`IG慈善包链接：（${giftLink}）{r}IG慈善包密码：（${giftPass}）{r}`);
        }
        if (list.length > 0) {
            if (txt.value != '') {
                txt.value += '\n';
            }
            txt.value += list.join('\n');
        }
    } else {
        alert('未找到可识别的礼物链接');
    }
    btn2.click();
}
function copy() {
    let btn2 = document.getElementById('btnCopy');
    btn2.textContent = '已复制';
    setTimeout(()=>{
        btn2.textContent='复制';
    },1000);
}
function clear() {
    let txt = document.getElementById('extractLinks');
    txt.value = '';
}