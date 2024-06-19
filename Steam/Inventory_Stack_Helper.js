// ==UserScript==
// @name:zh-CN      Steam 库存物品堆叠工具
// @name            Inventory_Stack_Helper
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.0
// @description     Steam 物品堆叠工具
// @author          Chr_
// @match           https://steamcommunity.com/profiles/*/inventory*
// @match           https://steamcommunity.com/id/*/inventory*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_registerMenuCommand
// @grant           GM_addStyle
// ==/UserScript==

// 初始化
(() => {
    "use strict";

    let token = document.querySelector("#application_config")?.getAttribute("data-loyalty_webapi_token");
    if (token) {
        token = token.replace(/"/g, "");
    }
    else {
        ShowPromptDialog("读取Token失败, 可能需要重新登录");
        return;
    }

    const GObjs = addPanel();
    loadSetting();

    //==================================================================================================

    function genBtn(text, title, onclick) {
        let btn = document.createElement("button");
        btn.textContent = text;
        btn.title = title;
        btn.className = "ish_button";
        btn.addEventListener("click", onclick);
        return btn;
    }
    function genSpan(text) {
        let span = document.createElement("span");
        span.textContent = text;
        return span;
    }
    function genNumber(value, placeholder, clsName) {
        const t = document.createElement("input");
        t.className = clsName ?? "ish_inputbox";
        t.placeholder = placeholder;
        t.type = "number";
        t.value = value;
        return t;
    }

    function addPanel() {
        const btnArea = document.querySelector("div.inventory_links");

        const container = document.createElement("div");
        container.className = "ish_container"
        btnArea.insertBefore(container, btnArea.firstChild);

        const iptAppId = genNumber("", "AppId");
        const iptContextId = genNumber("", "ContextId");
        const iptDelay = genNumber("500", "延时", "ish_short");
        const iptAmount = genNumber("500", "数量", "ish_short");

        const btnFitInv = genBtn("库存", "设置为当前库存", doFitInventory);
        const btnStack = genBtn("堆叠", "堆叠库存中的物品", doStack);
        const btnUnstack = genBtn("反堆叠", "取消堆叠库存中的物品", doUnstack);
        const btnHelp = genBtn("❓", "查看帮助", doHelp);
        const spStatus = genSpan("");

        container.appendChild(btnFitInv);
        container.appendChild(iptAppId);
        container.appendChild(iptContextId);

        container.appendChild(genSpan("延时"));
        container.appendChild(iptDelay);
        container.appendChild(genSpan("上限"));
        container.appendChild(iptAmount);

        container.appendChild(btnStack);
        container.appendChild(btnUnstack);
        container.appendChild(btnHelp);
        container.appendChild(spStatus);

        return { iptAppId, iptContextId, iptDelay, iptAmount, btnFitInv, btnStack, btnUnstack, spStatus };
    }

    function doHelp() {
        const { script: { version } } = GM_info;

        console.log(GM_info);

        ShowAlertDialog("帮助",
            [
                "<p>【库存】: 获取当前激活的库存, 自动填入 AppId 和 ContextId</p>",
                "<p>【延时】: 发送每个网络请求之间的间隔, 建议设置为 100 以上</p>",
                "<p>【上限】: 读取库存物品的数量上限, 默认为 500, 如果物品很多, 可以按照实际情况适当调大</p>",
                "<p>【堆叠】: 将指定库存中的同类物品堆叠到一起</p>",
                "<p>【反堆叠】: 将指定库存中的已堆叠物品拆分成单个物品</p>",
                `<p>【<a href="https://keylol.com/t747892-1-1" target="_blank">发布帖</a>】 【<a href="https://blog.chrxw.com/scripts.html" target="_blank">脚本反馈</a>】</p>`,
                `<p>【Developed by <a href="https://steamcommunity.com/id/Chr_" target="_blank">Chr_</a>】 【当前版本 ${version}】</p>`,
            ].join("<br>")

        )
    }

    function doFitInventory() {
        const { iptAppId, iptContextId } = GObjs;
        const { appid, contextid } = g_ActiveInventory;

        if (appid == 753 && contextid == "0") {
            contextid = "6";
        }

        iptAppId.value = appid ?? "0";
        iptContextId.value = contextid ?? "2";
    }

    function doStack() {
        const { iptAppId, iptContextId, iptDelay, iptAmount, btnStack, btnUnstack, spStatus } = GObjs;

        const appId = parseInt(iptAppId.value);
        const contextId = parseInt(iptContextId.value);
        if (appId !== appId || contextId !== contextId) {
            ShowAlertDialog("提示", "请检查 AppId 和 ContextId 是否填写正确");
            return;
        }

        const delay = parseInt(iptDelay.value);
        if (delay !== delay) {
            ShowAlertDialog("提示", "请检查 延时 是否填写正确");
            return;
        }

        const amount = parseInt(iptAmount.value);
        if (amount !== amount) {
            ShowAlertDialog("提示", "请检查 上限 是否填写正确");
            return;
        }

        saveSetting();

        spStatus.textContent = "堆叠中 [正在加载库存]";
        btnStack.style.display = "none";
        btnUnstack.style.display = "none";

        loadInventory(appId, contextId, amount)
            .then(async (inv) => {
                if (!inv) {
                    ShowAlertDialog("提示", "库存读取失败, 请检查 AppId 和 ContextId 是否填写正确");
                    return;
                }

                const { assets } = inv;
                if (assets) {
                    const itemGroup = {};

                    let typeCount = 0;

                    for (let item of assets) {
                        const { classid } = item;
                        if (!itemGroup[classid]) {
                            itemGroup[classid] = [];
                            typeCount++;
                        }
                        itemGroup[classid].push(item);
                    }

                    spStatus.textContent = `堆叠中 [0/${typeCount} 0%]`;

                    let j = 1;

                    for (let classId in itemGroup) {
                        const items = itemGroup[classId];

                        if (items.length <= 1) {
                            spStatus.textContent = `堆叠中 [${j++}/${typeCount} 100%]`;
                            continue;
                        }

                        for (let i = 1; i < items.length; i++) {
                            await stackItem(iptAppId.value, items[i].assetid, items[0].assetid, items[i].amount);
                            await asyncDelay(delay);
                            const percent = (100 * i / items.length).toFixed(2);
                            spStatus.textContent = `堆叠中 [${j}/${typeCount} ${percent}%]`;
                        }
                        j++;
                    }

                } else {
                    ShowAlertDialog("提示", "库存读取失败, 请检查 AppId 和 ContextId 是否填写正确");
                }
            })
            .catch((err) => {
                ShowAlertDialog("提示", "库存读取出错, 错误信息\r\n" + err);
                console.error(err);
            })
            .finally(() => {
                ShowAlertDialog("提示", "堆叠操作完成");
                spStatus.textContent = "";
                btnStack.style.display = null;
                btnUnstack.style.display = null;
            });
    }

    function doUnstack() {
        const { iptAppId, iptContextId, iptDelay, iptAmount, btnStack, btnUnstack, spStatus } = GObjs;

        const appId = parseInt(iptAppId.value);
        const contextId = parseInt(iptContextId.value);
        if (appId !== appId || contextId !== contextId) {
            ShowAlertDialog("提示", "请检查 AppId 和 ContextId 是否填写正确");
            return;
        }

        const delay = parseInt(iptDelay.value);
        if (delay !== delay) {
            ShowAlertDialog("提示", "请检查 延时 是否填写正确");
            return;
        }

        const amount = parseInt(iptAmount.value);
        if (amount !== amount) {
            ShowAlertDialog("提示", "请检查 上限 是否填写正确");
            return;
        }

        saveSetting();

        spStatus.textContent = "反堆叠中 [正在加载库存]";
        btnStack.style.display = "none";
        btnUnstack.style.display = "none";

        loadInventory(appId, contextId, amount)
            .then(async (inv) => {
                if (!inv) {
                    ShowAlertDialog("提示", "库存读取失败, 请检查 AppId 和 ContextId 是否填写正确");
                    return;
                }

                const { assets } = inv;
                if (assets) {
                    const itemGroup = [];

                    for (let item of assets) {
                        const { amount } = item;

                        const num = parseInt(amount);
                        if (num > 1) {
                            item.amount = num;
                            itemGroup.push(item);
                        }
                    }

                    const typeCount = itemGroup.length;

                    spStatus.textContent = `反堆叠中 [0/${typeCount} 0%]`;

                    let j = 1;

                    for (let item of itemGroup) {
                        if (item.amount <= 1) {
                            spStatus.textContent = `反堆叠中 [${j++}/${typeCount} 100%]`;
                            continue;
                        }

                        for (let i = 1; i < item.amount; i++) {
                            await unStackItem(iptAppId.value, item.assetid, 1);
                            await asyncDelay(delay);
                            const percent = (100 * i / item.amount).toFixed(2);
                            spStatus.textContent = `反堆叠中 [${j}/${typeCount} ${percent}%]`;
                        }
                        j++;
                    }
                } else {
                    ShowAlertDialog("提示", "库存读取失败, 请检查 AppId 和 ContextId 是否填写正确");
                }
            })
            .catch((err) => {
                ShowAlertDialog("提示", "库存读取出错, 错误信息\r\n" + err);
                console.error(err);
            })
            .finally(() => {
                ShowAlertDialog("提示", "反堆叠操作完成");
                spStatus.textContent = "";
                btnStack.style.display = null;
                btnUnstack.style.display = null;
            });
    }

    function loadSetting() {
        const { iptAppId, iptContextId, iptDelay, iptAmount } = GObjs;
        iptAppId.value = localStorage.getItem("ish_appId") ?? "";
        iptContextId.value = localStorage.getItem("ish_contextId") ?? "";
        iptDelay.value = localStorage.getItem("ish_delay") ?? "500";
        iptAmount.value = localStorage.getItem("ish_amount") ?? "500";
    }

    function saveSetting() {
        const { iptAppId, iptContextId, iptDelay, iptAmount } = GObjs;
        localStorage.setItem("ish_appId", iptAppId.value);
        localStorage.setItem("ish_contextId", iptContextId.value);
        localStorage.setItem("ish_delay", iptDelay.value);
        localStorage.setItem("ish_amount", iptAmount.value);
    }

    //==================================================================================================

    // 延时
    function asyncDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 读取库存
    function loadInventory(appId, contextId, count) {
        return new Promise((resolve, reject) => {
            fetch(`https://steamcommunity.com/inventory/${g_steamID}/${appId}/${contextId}?l=${g_strLanguage}&count=${count}`)
                .then(async (response) => {
                    response.json().then(json => {
                        resolve(json);
                    })
                })
                .catch((err) => {
                    console.error(err);
                    reject(`读取库存失败 ${err}`);
                });
        })
    }

    // 堆叠物品
    function stackItem(appId, fromAssetId, destAssetId, quantity) {
        return new Promise((resolve, reject) => {
            fetch(
                `https://api.steampowered.com/IInventoryService/CombineItemStacks/v1/`,
                {
                    method: "POST",
                    body: `access_token=${token}&appid=${appId}&fromitemid=${fromAssetId}&destitemid=${destAssetId}&quantity=${quantity}&steamid=${g_steamID}`,
                    headers: {
                        "content-type":
                            "application/x-www-form-urlencoded; charset=UTF-8",
                    },
                }
            )
                .then((response) => {
                    response.json().then(json => {
                        const { success } = json;
                        resolve(success);
                    })
                })
                .catch((err) => {
                    console.error(err);
                    reject(`确认付款失败 ${err}`);
                });
        });
    }

    // 取消堆叠物品
    function unStackItem(appId, itemAssetId, quantity) {
        return new Promise((resolve, reject) => {
            fetch(
                `https://api.steampowered.com/IInventoryService/SplitItemStack/v1/`,
                {
                    method: "POST",
                    body: `access_token=${token}&appid=${appId}&itemid=${itemAssetId}&quantity=${quantity}&steamid=${g_steamID}`,
                    headers: {
                        "content-type":
                            "application/x-www-form-urlencoded; charset=UTF-8",
                    },
                }
            )
                .then((response) => {
                    response.json().then(json => {
                        const { success } = json;
                        resolve(success);
                    })
                })
                .catch((err) => {
                    console.error(err);
                    reject(`确认付款失败 ${err}`);
                });
        });
    }
})();

GM_addStyle(`
div.ish_container {
  display: inline;
}

div.ish_container > * {
  margin-right: 10px;
}

input.ish_inputbox {
  width: 80px;
  padding: 5px;
}

input.ish_short {
  width: 50px;
  padding: 5px;
}
`);