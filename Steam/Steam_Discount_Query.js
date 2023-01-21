// ==UserScript==
// @name:zh-CN      Steam折扣截止日期查询
// @name            Steam_Discount_Query
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.0
// @description:zh-CN  查询折扣截止日期
// @description     Query when the discounts expired
// @author          Chr_
// @match           https://store.steampowered.com/wishlist/*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_addStyle
// ==/UserScript==

(async () => {
    "use strict";
    //初始化
    let t = setInterval(() => {
        let container = document.getElementById("wishlist_ctn");
        if (container != null) {
            clearInterval(t);

            for (let ele of container.querySelectorAll("div.wishlist_row")) {
                addQueryButton(ele);
            }

            container.addEventListener("DOMNodeInserted", ({ relatedNode }) => {
                if (relatedNode.nodeName === "DIV") {
                    for (let ele of relatedNode.querySelectorAll("div.wishlist_row")) {
                        addQueryButton(ele);
                    }
                }
            });
        }
    }, 500);

    //添加按钮
    function addQueryButton(element) {
        if (element.getAttribute("added_sdq") !== null) { return; }
        element.setAttribute("added_sdq", "");

        let appID = element.getAttribute("data-app-id");
        if (appID === null) { return; }

        let btn = document.createElement("button");
        btn.addEventListener("click", (e) => {
            displaySaleEnds(appID, btn);
            e.preventDefault();
        }, false);
        btn.className = "sdq_listbtns";
        btn.textContent = "🔍";
        element.appendChild(btn);
    }

    //显示折扣结束时间
    async function displaySaleEnds(appID, ele) {
        ele.enabled = false;
        ele.className+=" sdq_listbtns_show";
        ele.textContent = "🔍……";
        fetchSaleEnds(appID)
            .then((endDate) => {
                ele.textContent = endDate;
            })
            .catch((err) => {
                let done = showAlert("网络错误", `<p>${err}</p>`, false);
                setTimeout(() => { done.Dismiss(); }, 2000);
                dialog.Dismiss();
            }).finally(() => {
                ele.enabled = true;
            });
    }

    //读取折扣结束时间
    function fetchSaleEnds(appID) {
        const regSaleEnds = new RegExp(/<p class="game_purchase_discount_countdown">(.+)<\/p>/, "");
        const regDate = new RegExp(/\d+ 月 \d+ 日/, "");
        const regTimestamp = new RegExp(/InitDailyDealTimer\( \$DiscountCountdown, (\d+) \);/, "");

        return new Promise((resolve, reject) => {
            fetch(`https://store.steampowered.com/app/${appID}/?lang=schinese`, { method: "GET", credentials: "include", })
                .then(async (response) => {
                    if (response.ok) {
                        const html = await response.text();
                        const saleEnds = html.match(regSaleEnds)?.pop();
                        let endDate;

                        if (saleEnds) {
                            endDate = saleEnds.match(regDate)?.pop();
                            if (!endDate) {
                                const endsTimestamp = html.match(regTimestamp)?.pop();
                                const timestamp = parseInt(endsTimestamp) * 1000;
                                const date = new Date(timestamp);

                                if (date.getDate() === date.getDate()) {
                                    endDate = `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
                                } else {
                                    endDate = "解析失败";
                                }
                            }
                        } else {
                            endDate = "未打折";
                        }

                        console.info(endDate);
                        resolve(endDate);
                    } else {
                        resolve("请求失败");
                    }
                }).catch((err) => {
                    reject(err);
                });
        });
    }
    //显示提示
    function showAlert(title, text, succ = true) {
        return ShowAlertDialog(`${succ ? "✅" : "❌"}${title}`, text);
    }
})();

GM_addStyle(`
    button.sdq_listbtns {
        display: none;
        position: relative;
        z-index: 100;
        padding: 1px;
    }
    div.wishlist_row > button.sdq_listbtns {
        top: 35%;
        right: 35%;
        position: absolute;
    }
    button.sdq_listbtns_show,
    div.wishlist_row:hover button.sdq_listbtns {
        display: block;
    }
    `);