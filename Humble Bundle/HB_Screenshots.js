// ==UserScript==
// @name:zh-CN      HB截图助手
// @name            HB_Screenshots
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         2.2
// @description     一键生成密钥截图
// @description:zh-CN  一键生成密钥截图
// @author          Chr_
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @require         https://cdn.jsdelivr.net/gh/chr233/GM_Scripts@30e200849c5b913355ab6869b040eb7367ec20a7/Lib/html2canvas.js
// @include         /https:\/\/www\.humblebundle\.com\/downloads\?key=\S+/
// @grant           GM_setClipboard
// ==/UserScript==

(() => {
    "use strict";
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
            const b = document.createElement("button");
            b.textContent = txt;
            b.addEventListener("click", foo);
            b.style.cssText = "font-size: 10px;margin: 2px;";
            return b;
        }
        const divBtns = document.createElement("div");

        const btnScraper = genBtn("一键刮Key", scraperKeys);
        divBtns.appendChild(btnScraper);

        const btnGenImg = genBtn("生成截图(右键图片复制)", genImage);
        divBtns.appendChild(btnGenImg);

        const label = document.createElement("label");
        label.textContent = " 复制为: ";
        label.style.fontSize = "10px";
        divBtns.appendChild(label);

        const btnCopyTxt = genBtn("纯文本", copyTxt);
        divBtns.appendChild(btnCopyTxt);

        const btnCopyCSV = genBtn("CSV", copyCSV);
        divBtns.appendChild(btnCopyCSV);

        const btnCopyMD = genBtn("Markdown", copyMD);
        divBtns.appendChild(btnCopyMD);

        const btnCopyHTML = genBtn("HTML表格", copyHTML);
        divBtns.appendChild(btnCopyHTML);

        const divCnv = document.createElement("div");
        divCnv.style.cssText = "max-height: 200px;overflow: scroll;";
        divCnv.style.display = "none";

        const title = document.querySelector("#hibtext");
        title.appendChild(divBtns);
        title.appendChild(divCnv);

        Object.assign(GObjs, { divCnv });
    }
    function waitLoading() {
        if (document.querySelector("div.key-list h4") != null) {
            clearInterval(GTimer);
            addRemover();
        }
    }
    function addRemover() {
        function genBtn(ele) {
            const b = document.createElement("button");
            b.className = "hb_sc";
            b.addEventListener("click", () => { ele.innerHTML = ""; });
            b.textContent = "×";
            b.style.cssText = "position: relative;left: -30px;top: -100px;";
            return b;
        }
        const keys = document.querySelectorAll("div.key-list>div");
        if (keys) {
            keys.forEach(ele => {
                const btn = genBtn(ele);
                ele.appendChild(btn);
            });
        }
    }
    async function genImage() {
        const { divCnv } = GObjs;
        const steam = document.querySelector(".sr-user");
        const helps = document.querySelectorAll("div[class='key-container wrapper']>div>p");
        const btns = document.querySelectorAll("button.hb_sc");
        if (btns || btns.length > 0) {
            if (steam) { steam.style.display = "none"; }
            if (helps) { helps.forEach(ele => { ele.style.display = "none"; }); }
            divCnv.style.display = "";
            const keyArea = document.querySelector("div[class='key-container wrapper']");
            const canvas = await html2canvas(keyArea, {});
            const img = document.createElement("img");
            img.src = canvas.toDataURL("image/png");
            divCnv.innerHTML = "";
            divCnv.appendChild(img);
            if (steam) { steam.style.display = ""; }
            if (helps) {
                for (const help of helps) {
                    help.style.display = "";
                }
            }
        } else {
            alert("Key列表为空?\n或许是卡DOM了，刷新一下即可。");
        }
    }
    function parseKeys() {
        const data = [];
        const keys = document.querySelectorAll("div.key-list>div");
        if (keys) {
            for (const key of keys) {
                const title = key.querySelector("h4");
                const keyStr = key.querySelector("div.keyfield-value");
                if (title && keyStr) {
                    data.push([title.textContent.trim(), keyStr.textContent]);
                } else {
                    console.log(title, keyStr);
                }
            }
        }
        return data;
    }
    function scraperKeys() {
        const btns = document.querySelectorAll("[class='js-keyfield keyfield  enabled']");
        let i = 0;
        let t = setInterval(() => {
            if (i < btns.length) {
                btns[i++].click();
            } else {
                clearInterval(t);
            }
        }, 200);
    }
    function copyTxt() {
        const data = parseKeys();
        const list = [];
        for (const [title, key] of data) {
            list.push(`${title}  ${key}`);
        }
        setClipboard(list.join("\n"), "text");
        alert("复制成功");
    }
    function copyCSV() {
        const data = parseKeys();
        const list = ["游戏名, Key"];
        for (const [title, key] of data) {
            list.push(`${title}, ${key}`);
        }
        setClipboard(list.join("\n"), "text");
        alert("复制成功");
    }
    function copyMD() {
        const data = parseKeys();
        const list = ["| 游戏名 | Key |", "| --- | --- |"];
        for (const [title, key] of data) {
            list.push(`| ${title} | ${key} |`);
        }
        setClipboard(list.join("\n"), "text");
        alert("复制成功");
    }
    function copyHTML() {
        const data = parseKeys();
        const tdCss = "style=\"padding:5px 10px;border-top:1px solid;\"";
        const list = [
            "<table style=\"border-collapse:collapse;margin-bottom:0.7em;\">",
            "<tr><th>游戏名</th><th>Key</th></tr>"
        ];
        for (const [title, key] of data) {
            list.push(`<tr><td ${tdCss}>${title}</td><td ${tdCss}>${key}</td></tr>`);
        }
        list.push("</table>");
        setClipboard(list.join("\n"), "html");
        alert("复制成功");
    }
    function setClipboard(data, dataType = "text") {
        GM_setClipboard(data, dataType);
    }
})();