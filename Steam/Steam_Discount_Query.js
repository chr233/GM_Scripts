// ==UserScript==
// @name:zh-CN      Steam折扣截止日期查询
// @name            Steam_Discount_Query
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.3
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
    const t = setInterval(() => {
        const containers = document.querySelectorAll("div[class='Panel']");
        let container = null;
        for (let ele of containers) {
            if (!ele.getAttribute("data-index")) {
                container = ele.querySelector("div");
                break;
            }
        }

        if (container != null) {
            clearInterval(t);

            for (let ele of container.querySelectorAll("div[data-index]")) {
                addQueryButton(ele);
            }

            // 观察配置
            const config = { childList: true, subtree: true };

            // 回调函数
            const callback = (mutationsList, observer) => {
                for (let mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        for (let node of mutation.addedNodes) {
                            if (node.nodeType === 1 && node.matches('div[data-index]')) {
                                addQueryButton(node);
                            }
                        }
                    }
                }
            };

            // 创建观察者实例
            const observer = new MutationObserver(callback);

            // 开始观察
            observer.observe(container, config);
        }
    }, 1000);

    const matchAppId = /app\/(\d+)/;

    //添加按钮
    function addQueryButton(element) {
        const href = element.querySelector("a")?.getAttribute("href");

        const match = href.match(matchAppId);
        if (!match) {
            return;
        }
        const appID = match[1];

        const ele = element.querySelector("button")?.parentElement;

        if (ele) {
            const btn = document.createElement("button");
            btn.addEventListener("click", (e) => {
                displaySaleEnds(appID, btn);
                e.preventDefault();
            }, false);
            btn.className = "sdq_listbtns";
            btn.textContent = "🔍";
            ele.appendChild(btn);
        }
    }

    //显示折扣结束时间
    async function displaySaleEnds(appID, ele) {
        ele.enabled = false;
        ele.className += " sdq_listbtns_show";
        ele.textContent = "🔍……";
        fetchSaleEnds(appID)
            .then((endDate) => {
                ele.textContent = endDate;
                if (endDate.search(":") !== -1) {
                    ele.className += " sdq_listbtns_alert";
                }
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
                                    endDate = `${date.getMonth() + 1} 月 ${date.getDate()} 日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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
    position: relative;
    z-index: 100;
    padding: 1px;
  }
  div.wishlist_row > button.sdq_listbtns {
    top: 35%;
    right: 33%;
    position: absolute;
  }
  button.sdq_listbtns_show,
  div.wishlist_row:hover button.sdq_listbtns {
    display: block;
  }
  button.sdq_listbtns_alert {
    color: red;
  }
`);