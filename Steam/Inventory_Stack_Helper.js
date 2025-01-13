// ==UserScript==
// @name:zh-CN         Steam 库存物品堆叠工具
// @name               Inventory_Stack_Helper
// @namespace          https://blog.chrxw.com
// @supportURL         https://blog.chrxw.com/scripts.html
// @contributionURL    https://afdian.com/@chr233
// @version            2.5
// @description        Steam 物品堆叠工具
// @description:zh-CN  Steam 物品堆叠工具
// @author             Chr_
// @match              https://steamcommunity.com/profiles/*/inventory*
// @match              https://steamcommunity.com/id/*/inventory*
// @license            AGPL-3.0
// @icon               https://blog.chrxw.com/favicon.ico
// @grant              GM_addStyle
// ==/UserScript==

// 初始化
(() => {
    "use strict";

    let GappId = 0;
    let GcontextId = 2;

    const delay = 300;
    const amount = 5000;

    let token = document.querySelector("#application_config")?.getAttribute("data-loyalty_webapi_token");
    if (token) {
        token = token.replace(/"/g, "");
    }
    else {
        ShowAlertDialog("提示", "读取Token失败, 可能需要重新登录");
        return;
    }

    const GObjs = addPanel();
    loadSetting();
    doFitInventory();

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
    function genNumber(value, placeholder, title) {
        const t = document.createElement("input");
        t.className = "ish_inputbox";
        t.placeholder = placeholder;
        t.title = title;
        t.type = "number";
        t.value = value;
        return t;
    }

    function addPanel() {
        const btnArea = document.querySelector("div.inventory_links");

        const container = document.createElement("div");
        container.className = "ish_container";
        btnArea.insertBefore(container, btnArea.firstChild);

        const hiddenContainer = document.createElement("div");
        hiddenContainer.style.display = "none";
        container.appendChild(hiddenContainer);


        const btnStack = genBtn("堆叠", "堆叠库存中的物品", doStack);
        const btnUnstack = genBtn("反堆叠", "取消堆叠库存中的物品", doUnstack);

        const iptStackMax = genNumber("0", "堆叠上限", "物品堆叠上限, 留空或者0表示不设置堆叠上限");

        const btnHelp = genBtn("❓", "查看帮助", doHelp);
        const spStatus = genSpan("");

        hiddenContainer.appendChild(genSpan("库存"));

        container.appendChild(btnStack);
        container.appendChild(btnUnstack);
        container.appendChild(btnHelp);
        container.appendChild(iptStackMax);
        container.appendChild(spStatus);

        document.querySelectorAll('div.games_list_tabs>a').forEach(tab => {
            tab.addEventListener("click", doFitInventory);
        });

        document.querySelector("#responsive_inventory_select")?.addEventListener("change", doFitInventory);

        return { btnStack, btnUnstack, iptStackMax, btnHelp, spStatus };
    }

    function doHelp() {
        const { script: { version } } = GM_info;

        ShowAlertDialog("帮助",
            [
                "<p>【堆叠】: 将指定库存中的同类物品堆叠到一起</p>",
                "<p>【反堆叠】: 将指定库存中的已堆叠物品拆分成单个物品</p>",
                `<p>【<a href="https://keylol.com/t954659-1-1" target="_blank">发布帖</a>】 【<a href="https://blog.chrxw.com/scripts.html" target="_blank">脚本反馈</a>】</p>`,
                `<p>【Developed by <a href="https://steamcommunity.com/id/Chr_" target="_blank">Chr_</a>】 【当前版本 ${version}】</p>`,
            ].join("<br>")

        );
    }

    function doFitInventory() {
        const { appid, contextid } = g_ActiveInventory;

        GappId = appid ?? "0";
        GcontextId = contextid ?? "2";

        if (GappId == 753) {
            GcontextId = "6";
        }
    }

    function doStack() {
        const { btnStack, btnUnstack, iptStackMax, btnHelp, spStatus } = GObjs;

        if (GappId !== GappId || GcontextId !== GcontextId) {
            ShowAlertDialog("提示", "库存状态无效");
            return;
        }

        let stackMax = 0;
        if (iptStackMax.value) {
            stackMax = parseInt(iptStackMax.value);
            if (stackMax !== stackMax) {
                ShowAlertDialog("提示", "请检查 堆叠上限 是否填写正确");
                return;
            }
        }

        saveSetting();

        spStatus.textContent = "堆叠中 [正在加载库存]";
        btnStack.style.display = "none";
        btnUnstack.style.display = "none";
        btnHelp.style.display = "none";
        iptStackMax.style.display = "none";

        loadInventory(GappId, GcontextId, amount)
            .then(async (inv) => {
                if (!inv) {
                    ShowAlertDialog("提示", "库存读取失败, 请检查 AppId 和 ContextId 是否填写正确");
                    return;
                }

                const { assets } = inv;
                if (assets) {
                    const itemGroup = {};

                    for (let item of assets) {
                        const { classid } = item;

                        // 只处理宝珠和宝珠袋
                        if (GappId === 753) {
                            continue;
                        }

                        if (!itemGroup[classid]) {
                            itemGroup[classid] = [];
                        }
                        item.amount = parseInt(item.amount);
                        itemGroup[classid].push(item);
                    }

                    let totalReq = 0;
                    const todoList = [];
                    for (let classId in itemGroup) {
                        const items = itemGroup[classId];
                        if (stackMax === 0) {
                            if (items.length > 1) {
                                todoList.push(items);
                                totalReq += items.length - 1;
                            }
                        } else {
                            const stacks = [];
                            while (items.length > 0) {
                                const item = items.pop();
                                if (item.amount > stackMax) {
                                    continue;
                                }

                                let added = false;
                                for (let stack of stacks) {
                                    if (stack.amount + item.amount <= stackMax) {
                                        stack.list.push(item);
                                        stack.amount += item.amount;
                                        added = true;
                                        break;
                                    }
                                }

                                if (!added) {
                                    stacks.push({ list: [item,], amount: item.amount });
                                }
                            }

                            for (let stack of stacks) {
                                if (stack.list.length >= 1) {
                                    todoList.push(stack.list);
                                    totalReq += stack.list.length - 1;
                                }
                            }
                        }
                    }

                    if (totalReq > 0) {
                        const totalType = todoList.length;
                        spStatus.textContent = `堆叠中 [种类 0/${totalType} 请求 0/${totalReq} 0.00%]`;

                        let type = 1;
                        let req = 1;
                        for (let items of todoList) {
                            for (let i = 1; i < items.length; i++) {
                                await stackItem(GappId, items[i].assetid, items[0].assetid, items[i].amount);
                                await asyncDelay(delay);
                                const percent = (100 * req / totalReq).toFixed(2);
                                spStatus.textContent = `堆叠中 [种类 ${type}/${totalType} 请求 ${req++}/${totalReq} ${percent}%]`;
                            }
                            type++;
                        }
                    }

                    ShowAlertDialog("提示", totalReq > 0 ? "堆叠操作完成" : "无可堆叠物品");
                } else {
                    ShowAlertDialog("提示", "读取库存失败, 请稍后重试");
                }
            })
            .catch((err) => {
                ShowAlertDialog("提示", "库存读取出错, 错误信息\r\n" + err);
                console.error(err);
            })
            .finally(() => {
                spStatus.textContent = "";
                btnStack.style.display = null;
                btnUnstack.style.display = null;
                btnHelp.style.display = null;
                iptStackMax.style.display = null;
                g_ActiveInventory.m_owner.ReloadInventory(appId, contextId);
            });
    }

    function doUnstack() {
        const { btnStack, btnUnstack, iptStackMax, btnHelp, spStatus } = GObjs;

        if (GappId !== GappId || GcontextId !== GcontextId) {
            ShowAlertDialog("提示", "请检查 AppId 和 ContextId 是否填写正确");
            return;
        }

        saveSetting();

        spStatus.textContent = "反堆叠中 [正在加载库存]";
        btnStack.style.display = "none";
        btnUnstack.style.display = "none";
        btnHelp.style.display = "none";
        iptStackMax.style.display = "none";

        loadInventory(GappId, GcontextId, amount)
            .then(async (inv) => {
                if (!inv) {
                    ShowAlertDialog("提示", "库存读取失败, 请检查 AppId 和 ContextId 是否填写正确");
                    return;
                }

                const { assets } = inv;
                if (assets) {
                    const itemGroup = [];
                    let totalReq = 0;
                    for (let item of assets) {
                        const { amount } = item;

                        if (GappId === 753) {
                            continue;
                        }

                        if (amount > 1) {
                            item.amount = amount;
                            itemGroup.push(item);
                            totalReq += amount - 1;
                        }
                    }

                    if (totalReq > 0) {
                        const totalType = itemGroup.length;

                        spStatus.textContent = `反堆叠中 [种类 0/${totalType} 请求 0/${totalReq} 0.00%]`;

                        let type = 1;
                        let req = 1;

                        for (let item of itemGroup) {
                            for (let i = 1; i < item.amount; i++) {
                                await unStackItem(GappId, item.assetid, 1);
                                await asyncDelay(delay);
                                const percent = (100 * req / totalReq).toFixed(2);
                                spStatus.textContent = `反堆叠中 [种类 ${type}/${totalType} 请求 ${req++}/${totalReq} ${percent}%]`;
                            }
                            type++;
                        }
                    }

                    ShowAlertDialog("提示", totalReq > 0 ? "反堆叠操作完成" : "无可反堆叠物品");
                } else {
                    ShowAlertDialog("提示", "库存读取失败, 请检查 AppId 和 ContextId 是否填写正确");
                }
            })
            .catch((err) => {
                ShowAlertDialog("提示", "库存读取出错, 错误信息\r\n" + err);
                console.error(err);
            })
            .finally(() => {
                spStatus.textContent = "";
                btnStack.style.display = null;
                btnUnstack.style.display = null;
                btnHelp.style.display = null;
                iptStackMax.style.display = null;
                g_ActiveInventory.m_owner.ReloadInventory(appId, contextId);
            });
    }

    function loadSetting() {
        const { iptStackMax } = GObjs;
        iptStackMax.value = localStorage.getItem("ish_limit") ?? "0";
    }

    function saveSetting() {
        const { iptStackMax } = GObjs;
        localStorage.setItem("ish_limit", iptStackMax.value);
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
                        if (json) {
                            resolve(json);
                        } else {
                            fetch(`https://steamcommunity.com/inventory/${g_steamID}/${appId}/${contextId}?l=${g_strLanguage}&count=${count}`)
                                .then(async (response) => {
                                    response.json().then(json => {
                                        if (json) {
                                            resolve(json);
                                        } else {
                                            fetch(`https://steamcommunity.com/inventory/${g_steamID}/${appId}/${contextId}?l=${g_strLanguage}&count=${count}`)
                                                .then(async (response) => {
                                                    response.json().then(json => {
                                                        if (json) {
                                                            resolve(json);
                                                        } else {

                                                        }
                                                    });
                                                })
                                                .catch((err) => {
                                                    console.error(err);
                                                    reject(`读取库存失败 ${err}`);
                                                });
                                        }
                                    });
                                })
                                .catch((err) => {
                                    console.error(err);
                                    reject(`读取库存失败 ${err}`);
                                });
                        }
                    });
                })
                .catch((err) => {
                    console.error(err);
                    reject(`读取库存失败 ${err}`);
                });
        });
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
                    });
                })
                .catch((err) => {
                    console.error(err);
                    reject(`堆叠物品失败 ${err}`);
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
                    });
                })
                .catch((err) => {
                    console.error(err);
                    reject(`取消堆叠物品失败 ${err}`);
                });
        });
    }
})();

GM_addStyle(`
div.ish_container {
  display: inline;
}

div.ish_container > * {
  margin-right: 5px;
}

input.ish_inputbox {
  width: 70px;
  padding: 5px;
}

input.ish_inputbox:nth-of-type(3),
input.ish_inputbox:nth-of-type(4){
  width: 50px;
}
`);