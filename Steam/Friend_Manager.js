// ==UserScript==
// @name:zh-CN      好友管理工具
// @name            Friend_Manager
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.0
// @description     按照共同群组或者隐私设置管理好友
// @description:zh-CN  按照共同群组或者隐私设置管理好友
// @author          Chr_
// @include         https://store.steampowered.com/curator/*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_addStyle
// ==/UserScript==

// 初始化
(() => {
    "use strict";
    let lastPathname = "";
    let lastCount = 0;

    setInterval(() => {
        if (location.pathname !== lastPathname) {
            lastPathname = location.pathname;

            if (location.pathname.includes("admin/review_create")) {
                const [_, curator, appid] = lastPathname.match(
                    /\/curator\/([^\/]+)\/admin\/review_create\/(\d+)/
                ) ?? [null, null, null];

                if (curator !== null && appid !== null) {
                    const btnArea = document.querySelector("div.titleframe");
                    const btn = genBtn(
                        "删除该评测",
                        "ct_btn",
                        async () => await deleteReview(curator, appid)
                    );
                    btnArea.appendChild(btn);
                    const link = genA("https://store.steampowered.com/app/" + appid);
                    const btn2 = genBtn(
                        "商店页",
                        "ct_btn"
                    );
                    link.appendChild(btn2);
                    btnArea.appendChild(link);
                }
            } else if (location.pathname.includes("admin/stats")) {
                injectBtn();
                injectGotoBtn();

                lastCount = document.querySelectorAll(
                    "#RecentReferralsRows td>.ct_div,#TopReferralsRows td>.ct_div"
                ).length;

                const spanList = document.querySelectorAll(
                    "#RecentReferrals_controls>span,#RecentReferrals_controls>span>span,#TopReferrals_controls>span,#TopReferrals_controls>span>span"
                );
                for (let span of spanList) {
                    span.addEventListener("click", updateInjectBtn);
                }
            }
        }
    }, 500);

    function genBtn(text, cls, foo) {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.className = cls;
        btn.addEventListener("click", foo);
        return btn;
    }
    function genA(url) {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        return a;
    }
    function genDiv(cls) {
        const div = document.createElement("div");
        div.className = cls;
        return div;
    }
    function genSpan(name) {
        const span = document.createElement("span");
        span.textContent = name;
        return span;
    }


    //读取群组共同好友
    function getReviewType(group, page = 1) {
        return new Promise((resolve, reject) => {
            fetch(`https://steamcommunity.com/groups/${group}/members/?friends=1&p=${page}`, {
                method: "GET",
                credentials: "include",
            })
                .then(async (response) => {
                    if (response.ok) {
                        const data = await response.text();
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(data, "text/html");
                        const container = xmlDoc.querySelector("#memberList");
                        const linkFriends = container.querySelectorAll(".member_block a.linkFriend");

                        const result = [];
                        const regex = /steamcommunity\.com\/((?:id\/[^"]+)|(?:profiles\/\d+))/;
                        for (let link of linkFriends) {
                            const href = link.href;
                            const match = href.match(regex);
                            if (match) {
                                result.push(match[1]);
                            }
                        }
                        console.log(result);
                        resolve(result);
                    } else {
                        console.error("网络请求失败");
                        resolve(null);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    resolve(null);
                });
        });
    }
})();

GM_addStyle(`
  .ct_btn {
    padding: 3px;
    margin-right: 10px;
  }
  .ct_btn2 {
    padding: 0 3px;
    margin-right: 10px;
  }
  td {
    height: 100%;
  }
  .ct_div {
    display: flex;
    align-content: center;
    align-items: center;
    height: 25px;
    width: 40px;
  }
  tr > td > .ct_div > .ct_btn {
    display: none;
  }
  tr:hover > td > .ct_div > .ct_btn {
    display: block;
  }
  `);
