// ==UserScript==
// @name:zh-CN      Steam折扣截止日期查询
// @name            Steam_Discount_Query
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
// @version         1.5
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

    const g_cache = {};

    //初始化
    const t = setInterval(() => {
        for (let ele of document.querySelectorAll("div.Panel div[data-index]")) {
            addQueryButton(ele);
        }
    }, 1000);

    const matchAppId = /app\/(\d+)/;

    //添加按钮
    function addQueryButton(element) {
        const oldBtn = element.querySelector("button.sdq_listbtns");
        if (oldBtn) {
            return;
        }

        const href = element.querySelector("a")?.getAttribute("href");

        const match = href.match(matchAppId);
        if (!match) {
            return;
        }
        const appId = match[1];

        const btn = document.createElement("button");
        btn.addEventListener(
            "click",
            (e) => {
                displaySaleEnds(appId, btn);
                e.preventDefault();
            },
            false
        );
        btn.className = "sdq_listbtns";
        btn.textContent = g_cache[appId] ?? "🔍";

        if (btn.textContent.search(":") !== -1) {
            btn.className += " sdq_listbtns_alert";
        }

        var inner = element.querySelector("div>div");
        inner.appendChild(btn);
    }

    //显示折扣结束时间
    async function displaySaleEnds(appId, ele) {
        ele.enabled = false;
        ele.className += " sdq_listbtns_show";
        ele.textContent = "🔍……";
        fetchSaleEnds(appId)
            .then((endDate) => {
                ele.textContent = endDate;
                g_cache[appId] = endDate;
                if (endDate.search(":") !== -1) {
                    ele.className += " sdq_listbtns_alert";
                }
            })
            .catch((err) => {
                let done = showAlert("网络错误", `<p>${err}</p>`, false);
                setTimeout(() => {
                    done.Dismiss();
                }, 2000);
                dialog.Dismiss();
            })
            .finally(() => {
                ele.enabled = true;
            });
    }

    //读取折扣结束时间
    function fetchSaleEnds(appId) {
        const regSaleEnds = new RegExp(
            /<p class="game_purchase_discount_countdown">(.+)<\/p>/,
            ""
        );
        const regDate = new RegExp(/\d+ 月 \d+ 日/, "");
        const regTimestamp = new RegExp(
            /InitDailyDealTimer\( \$DiscountCountdown, (\d+) \);/,
            ""
        );

        return new Promise((resolve, reject) => {
            fetch(`https://store.steampowered.com/app/${appId}/?lang=schinese`, {
                method: "GET",
                credentials: "include",
            })
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
                                    endDate = `${date.getMonth() + 1
                                        } 月 ${date.getDate()} 日 ${date
                                            .getHours()
                                            .toString()
                                            .padStart(2, "0")}:${date
                                                .getMinutes()
                                                .toString()
                                                .padStart(2, "0")}`;
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
                })
                .catch((err) => {
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
  position: absolute;
  z-index: 100;
  padding: 1px;
  right: 20px;
  top: 20px;
}
div.wishlist_row > button.sdq_listbtns {
  top: 35%;
  right: 33%;
  position: absolute;
}
button.sdq_listbtns_show,
div.wishlist_row:hover button.sdq_listbtns {
  display: flex;
}
button.sdq_listbtns_alert {
  color: red;
}
`);
