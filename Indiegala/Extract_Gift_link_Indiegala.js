// ==UserScript==
// @name:zh-CN         IG礼物链接提取
// @name               Extract_Gift_link_Indiegala
// @namespace          https://blog.chrxw.com/
// @version            0.6
// @description:zh-CN  Indiegala礼物链接提取
// @description        Indiegala礼物链接提取
// @author             Chr_
// @license            AGPL-3.0
// @icon               https://blog.chrxw.com/favicon.ico
// @match              https://www.indiegala.com/library
// @grant              GM_setClipboard
// ==/UserScript==

(() => {
    "use strict";

    let GObjs = {};

    addbtn();
    function addbtn() {
        let area = document.querySelector("div.profile-private-page-user");
        let dv1 = document.createElement("div");
        let dv2 = document.createElement("div");
        let dv3 = document.createElement("div");
        let btnExtractGift = document.createElement("button");
        let btnExtractKey = document.createElement("button");
        let btnCopy = document.createElement("button");
        let btnClear = document.createElement("button");
        let txtResult = document.createElement("textarea");
        dv1.style.cssText = "margin: 12px 0;display: flex;";
        dv2.style.cssText = "margin: 0 12px;display: block;";
        dv3.style.cssText = "margin: 0 12px;display: block;";
        btnExtractGift.addEventListener("click", extractGift);
        btnExtractKey.addEventListener("click", extractKey);
        btnCopy.addEventListener("click", copy);
        btnClear.addEventListener("click", clear);
        btnExtractGift.style.cssText = "display: inherit;";
        btnClear.style.cssText = "float: right;";
        btnExtractGift.textContent = "提取礼物链接";
        btnExtractKey.textContent = "提取Key";
        btnCopy.textContent = "复制";
        btnClear.textContent = "×";
        btnCopy.id = "btnCopy";
        txtResult.style.cssText = "width: 70%;white-space: nowrap;overflow: scroll;";
        txtResult.id = "extractLinks";
        dv2.appendChild(btnExtractGift);
        dv2.appendChild(btnExtractKey);
        dv3.appendChild(btnCopy);
        dv3.appendChild(btnClear);
        dv1.appendChild(dv2);
        dv1.appendChild(txtResult);
        dv1.appendChild(dv3);
        area.appendChild(dv1);
        Object.assign(GObjs, { txtResult, btnCopy })
    }
    function extractGift() {
        const { txtResult } = GObjs;
        let gifts = document.querySelectorAll("div.profile-private-page-library-gifts div.profile-private-page-library-gift-title > div.overflow-auto");
        if (gifts.length > 0) {
            let list = [];
            let old = txtResult.value;
            for (let gift of gifts) {
                let giftLink = gift.querySelector("a").href;
                let giftPass = gift.querySelector("div:last-child>span").textContent;
                if (old.indexOf(giftLink.substring(38,)) >= 0) {
                    console.log(`重复的礼物链接 ${giftLink.substring(38,)}`);
                    continue;
                }
                list.push(`IG慈善包链接：（ ${giftLink} ）{r}IG慈善包密码：（ ${giftPass} ）{r}`);
            }
            if (list.length > 0) {
                if (txtResult.value !== "") {
                    txtResult.value += "\n";
                }
                txtResult.value += list.join("\n");
            }
        } else {
            alert("未找到可识别的礼物链接");
        }
        copy();
    }
    function extractKey() {
        const { txtResult } = GObjs;
        let cols = document.querySelectorAll("div.profile-private-page-library-key-cont.overflow-auto");
        if (cols.length > 0) {
            let list = [];
            let old = txtResult.value;
            for (let col of cols) {
                const gameName = col.querySelector("div.profile-private-page-library-title-row-full")?.title ?? "";
                const gameKey = col.querySelector("input")?.value ?? "";

                if (old.indexOf(gameKey) >= 0) {
                    console.log(`重复的key ${giftLink.substring(38,)}`);
                    continue;
                }
                list.push(`${gameName}  ${gameKey}`);
            }
            if (list.length > 0) {
                if (txtResult.value !== "") {
                    txtResult.value += "\n";
                }
                txtResult.value += list.join("\n");
            }
        } else {
            alert("未找到可识别的Key信息");
        }
        copy();
    }
    function copy() {
        const { btnCopy, txtResult } = GObjs;
        GM_setClipboard(txtResult.value, "text");
        btnCopy.textContent = "已复制";
        setTimeout(() => { btnCopy.textContent = "复制"; }, 1000);
    }
    function clear() {
        const { txtResult } = GObjs;
        if (confirm("确定要清空吗？")) {
            txtResult.value = "";
        }
    }
})();