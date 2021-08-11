// ==UserScript==
// @name         HB_Screenshots
// @name:zh-CN   HB截图助手
// @namespace    https://blog.chrxw.com
// @version      1.1
// @description  一键生成密钥截图
// @description:zh-CN  一键生成密钥截图
// @author       Chr_
// @icon         https://blog.chrxw.com/favicon.ico
// @require      https://cdn.jsdelivr.net/gh/chr233/GM_Scripts@30e200849c5b913355ab6869b040eb7367ec20a7/Lib/html2canvas.js
// @include      /https:\/\/www\.humblebundle\.com\/downloads\?key=\S+/
// @grant        GM_setClipboard
// ==/UserScript==

(() => {
    'use strict';
    // 初始化
    const GObjs = {};
    let GTimer = 0;
    (() => {
        addGUI();
        GTimer = setInterval(() => {
            waitLoading();
        }, 500);
    })();
    function addGUI() {
        function genBtn(txt, foo) {
            const b = document.createElement('button');
            b.textContent = txt;
            b.addEventListener('click', foo);
            b.style.cssText = 'font-size: 10px;margin: 2px;';
            return b;
        }
        const divBtns = document.createElement('div');

        const btnGenImg = genBtn('生成截图(右键可以复制)', genImage);
        divBtns.appendChild(btnGenImg);

        const btnCopyTxt = genBtn('复制纯文本', copyTxt);
        divBtns.appendChild(btnCopyTxt);

        const btnCopyCSV = genBtn('复制CSV', copyCSV);
        divBtns.appendChild(btnCopyCSV);

        const btnCopyMD = genBtn('复制Markdown', copyMD);
        divBtns.appendChild(btnCopyMD);

        const divCnv = document.createElement('div');
        divCnv.style.cssText = 'max-height: 200px;overflow: scroll;';
        divCnv.style.display = 'none';

        const title = document.querySelector('#hibtext');
        title.appendChild(divBtns);
        title.appendChild(divCnv);

        Object.assign(GObjs, { divCnv });
    }
    function waitLoading() {
        if (document.querySelector('div.key-list h4') != null) {
            clearInterval(GTimer);
            addRemover();
        }
    }
    function addRemover() {
        function genBtn(ele) {
            const b = document.createElement('button');
            b.className = 'hb_sc';
            b.addEventListener('click', () => { ele.innerHTML = ''; });
            b.textContent = '×';
            b.style.cssText = 'position: relative;left: -30px;top: -100px;';
            return b;
        }
        const keys = document.querySelectorAll('div.key-list>div');
        if (keys) {
            keys.forEach(ele => {
                const btn = genBtn(ele);
                ele.appendChild(btn);
            });
        }
    }
    async function genImage() {
        const { divCnv } = GObjs;

        const btns = document.querySelectorAll('button.hb_sc');
        if (btns) {

            btns.forEach(btn => {
                btn.style.display = 'none';
            });

            divCnv.style.display = '';
            const keyArea = document.querySelector('div.key-list');
            var canvas = await html2canvas(keyArea, {});
            divCnv.innerHTML = '';
            divCnv.appendChild(canvas);

            btns.forEach(btn => {
                btn.style.display = '';
            });
        } else {
            alert('Key列表为空?');
        }

    }
    function parseKeys() {
        const data = [];
        const keys = document.querySelectorAll('div.key-list>div');
        if (keys) {
            keys.forEach(ele => {
                const title = ele.querySelector('h4');
                const key = ele.querySelector('div.keyfield-value');
                if (title != null && key != null) {
                    data.push([title.textContent.trim(), key.textContent]);
                }
            });
        }
        return data;
    }
    function copyTxt() {
        const data = parseKeys();
        const list = [];
        data.forEach(([title, key]) => {
            list.push(`${title}  ${key}`);
        });
        setClipboard(list.join('\n'));
        alert('复制成功');
    }
    function copyCSV() {
        const data = parseKeys();
        const list = [];
        list.push('游戏名,Key');
        data.forEach(([title, key]) => {
            list.push(`${title},${key}`);
        });
        setClipboard(list.join('\n'));
        alert('复制成功');
    }
    function copyMD() {
        const data = parseKeys();
        const list = [];
        list.push('|游戏名|Key|');
        list.push('|-|-|');
        data.forEach(([title, key]) => {
            list.push(`|${title}|${key}|`);
        });
        setClipboard(list.join('\n'));
        alert('复制成功');
    }
    function setClipboard(data) {
        GM_setClipboard(data, { type: 'text', mimetype: 'text/plain' })
    }
})();