// ==UserScript==
// @name         HB_Screenshots
// @name:zh-CN   HB截图助手
// @namespace    https://blog.chrxw.com
// @version      1.0
// @description  一键生成密钥截图
// @description:zh-CN  一键生成密钥截图
// @author       Chr_
// @icon         https://blog.chrxw.com/favicon.ico
// //@require      https://cdn.jsdelivr.net/gh/chr233/GM_Scripts@30e200849c5b913355ab6869b040eb7367ec20a7/Lib/canvas2image.js
// @require      https://cdn.jsdelivr.net/gh/chr233/GM_Scripts@30e200849c5b913355ab6869b040eb7367ec20a7/Lib/html2canvas.js
// @include      /https:\/\/www\.humblebundle\.com\/downloads\?key=\S+/
// @grant        GM_setClipboard
// ==/UserScript==

(() => {
    'use strict';
    // 初始化
    const GObjs = {};

    (() => {
        addGUI();
    })();

    function addGUI() {
        function genBtn(txt, foo) {
            const b = document.createElement('button');
            b.textContent = txt;
            b.addEventListener('click', foo);
            b.style.cssText = 'font-size: 10px;margin: 2px;';
            return b;
        }
        const btnDiv = document.createElement('div');

        const btnGenImg = genBtn('生成截图(右键可以复制)', genImage);
        btnDiv.appendChild(btnGenImg);

        const btnCopyTxt = genBtn('复制纯文本', copyTxt);
        btnDiv.appendChild(btnCopyTxt);

        const btnCopyCSV = genBtn('复制CSV', copyCSV);
        btnDiv.appendChild(btnCopyCSV);

        const btnCopyMD = genBtn('复制Markdown', copyMD);
        btnDiv.appendChild(btnCopyMD);

        const divCnv = document.createElement('div');
        divCnv.style.cssText = 'max-height: 200px;overflow: scroll;';
        btnDiv.appendChild(divCnv);

        const title = document.querySelector('#hibtext');
        title.appendChild(btnDiv);

        Object.assign(GObjs, { divCnv });
    }

    async function genImage() {
        const { divCnv } = GObjs;
        const keyArea = document.querySelector('div[class="key-container wrapper"]>div>div.key-list');
        var canvas = await html2canvas(keyArea, {});
        divCnv.innerHTML = '';
        divCnv.appendChild(canvas);
    }

    function parseKeys() {
        const data = [];
        const keys = document.querySelectorAll('div.key-list>div');
        if (keys) {
            keys.forEach(ele => {
                const title = ele.querySelector('h4').textContent;
                const key = ele.querySelector('div.keyfield-value').textContent;
                data.push([title.trim(), key]);
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
            list.push(`${title}  ${key}`);
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