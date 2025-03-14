// ==UserScript==
// @name            Find_Extra_card
// @name:zh-CN      Steam寻找多余的卡牌
// @namespace       https://blog.chrxw.com
// @version	        1.8
// @description	    查找徽章满级但是仍然有卡牌的游戏
// @description:zh-CN  查找徽章满级但是仍然有卡牌的游戏
// @author          Chr_
// @include         /https://steamcommunity\.com/(id|profiles)/[^\/]+/badges/?(\/$|\/\?)?/
// @supportURL      https://steamcn.com/t339531-1-1
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_addStyle
// @grant           GM_setClipboard
// ==/UserScript==

(() => {
    "use strict";
    const WorkTread = 5; // 抓取线程
    const SleepTime = 50; // 抓取间隔

    const { origin, pathname } = window.location;
    const MatchAppId = /gamecards\/(\d+)/;
    const Line = "==============================\n";

    let isWorking = false;

    init();
    //初始化
    function init() {
        const genBtn = (text, onclick) => {
            const btn = document.createElement("button");
            btn.textContent = text;
            btn.className = "btn_medium fec_btn";
            btn.addEventListener("click", onclick);
            return btn;
        };
        const bar = document.querySelector(".profile_small_header_text");
        const btnHelp = genBtn("❔说明", () => {
            const { script: { version } } = GM_info;
            ShowAlertDialog(``, [
                `<h2>【插件版本 ${version}】</h2>`,
                `<p>【📇查找本页】：查找当前页面, 徽章已经满级(5级), 但是库中仍然有多余卡牌的游戏</p>`,
                `<p>【📇查找全部】：查找所有徽章, 徽章已经满级(5级), 但是库中仍然有多余卡牌的游戏</p>`,
                `<p>【<a href="https://keylol.com/t772471-1-1" target="_blank">发布帖</a>】 【<a href="https://blog.chrxw.com/scripts.html" target="_blank">脚本反馈</a>】 【Developed by <a href="https://steamcommunity.com/id/Chr_" target="_blank">Chr_</a>】</p>`
            ].join(""));
        });
        const btnFindAll = genBtn("📇查找全部", findAllExtraCard);
        const btnFindOne = genBtn("📇查找本页", findCurrExtraCard);
        bar.appendChild(btnHelp);
        bar.appendChild(btnFindAll);
        bar.appendChild(btnFindOne);
    }
    //读取当前页
    async function findCurrExtraCard() {
        const [title, text, btnAbort] = showDialog();

        isWorking = true;
        btnAbort.disabled = false;
        title.innerText = "读取本页徽章信息";
        text.value += `开始运行 线程数量:${WorkTread}\n${Line}【AppId】 | 【持有】/【一套】 | 【游戏名】\n` + Line;

        const box = document.querySelector(".maincontent>.badges_sheet");
        if (box !== null) {
            const badges = parseDom2BadgeList(box);
            let count = 0;
            if (badges.length === 0) {
                text.value += "没有找到任何满级徽章\n";
            } else {
                title.innerText = `运行进度 【 0 / ${badges.length} 】`;
                for (let i = 0; i < badges.length && isWorking; i += WorkTread) {
                    const max = Math.min(i + WorkTread, badges.length);
                    const tasks = [];
                    for (let j = i; j < max; j++) {
                        const [url, name] = badges[j];
                        tasks.push(getCardInfo(url, name));
                    }
                    const values = await Promise.all(tasks);

                    for (const [succ, appId, name, sum, total] of values) {
                        if (succ && sum > 0) {
                            count++;
                            text.value += `${appId.padEnd(7)} | ${sum} / ${total} | ${name}\n`;
                        }
                    }
                    title.innerText = `运行进度 【 ${max} / ${badges.length} 】`;
                    await aiosleep(SleepTime);
                }
            }
            text.value += Line + `共找到 ${count} 个徽章满级但仍有剩余卡牌的游戏\n`;
        } else {
            text.value += Line + "没有找到任何徽章\n";
        }
        isWorking = false;
        title.innerText = "运行结束";
        btnAbort.disabled = true;
    }
    //读取全部
    async function findAllExtraCard() {
        const [title, text, btnAbort] = showDialog();
        isWorking = true;
        btnAbort.disabled = false;
        title.innerText = "读取全部徽章信息";
        text.value += `开始运行 线程数量:${WorkTread}\n${Line}【AppId】 | 【持有】/【一套】 | 【游戏名】\n` + Line;

        let count = 0;
        let page = 1;
        while (isWorking) {
            const ele = await getBadgeList(page++);

            if(ele===null){
                continue;
            }

            const box = ele.querySelector(".maincontent>.badges_sheet");
            if (box !== null) {
                const badges = parseDom2BadgeList(box);
                if (badges === null) {
                    break;
                }
                if (badges.length > 0) {
                    title.innerText = `运行进度 第【${page - 1}】页 【 0 / ${badges.length} 】`;
                    for (let i = 0; i < badges.length && isWorking; i += WorkTread) {
                        const max = Math.min(i + WorkTread, badges.length);
                        const tasks = [];
                        for (let j = i; j < max; j++) {
                            const [url, name] = badges[j];
                            tasks.push(getCardInfo(url, name));
                        }
                        const values = await Promise.all(tasks);

                        for (const [succ, appId, name, sum, total] of values) {
                            if (succ && sum > 0) {
                                count++;
                                text.value += `${appId.padEnd(7)} | ${sum} / ${total} | ${name}\n`;
                            }
                        }
                        title.innerText = `运行进度 第【${page - 1}】页 【 ${max} / ${badges.length} 】`;
                        await aiosleep(SleepTime);
                    }
                }
            }
        }

        if (count == 0) {
            text.value += Line + "没有找到任何徽章\n";
        } else {
            text.value += Line + `共找到 ${count} 个徽章满级但仍有剩余卡牌的游戏\n`;
        }

        isWorking = false;
        title.innerText = "运行结束";
        btnAbort.disabled = true;
    }

    //显示提示框
    function showDialog() {
        const genBtn = (text, onclick) => {
            const btn = document.createElement("button");
            btn.textContent = text;
            btn.className = "btn_medium fec_btn";
            if (onclick) { btn.addEventListener("click", onclick); }
            return btn;
        };
        const area = document.createElement("div");
        area.className = "fec_area";
        const tit = document.createElement("h2");
        tit.className = "fec_title";
        tit.innerText = "";
        const txt = document.createElement("textarea");
        txt.className = "fec_text";
        const action = document.createElement("div");
        action.className = "fec_action";
        const btnAbort = genBtn("⛔停止运行", () => {
            if (isWorking) {
                isWorking = false;
                tit.innerText = "已停止";
            }
        });
        btnAbort.disabled = true;
        const btnClose = genBtn("❌关闭", null);
        const btnCopy = genBtn("📋复制", () => {
            GM_setClipboard(txt.value, "text");
            btnCopy.innerText = "✅已复制";
            setTimeout(() => { btnCopy.innerText = "📋复制"; }, 1000);
        });
        action.appendChild(btnCopy);
        action.appendChild(btnAbort);
        action.appendChild(btnClose);
        area.appendChild(tit);
        area.appendChild(txt);
        area.appendChild(action);
        const diag = ShowDialog("", area, { bExplicitDismissalOnly: true });
        btnClose.addEventListener("click", () => { diag.Dismiss(); });
        return [tit, txt, btnAbort];
    }
    //异步Sleep
    function aiosleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    //解析徽章列表的DOM节点
    function parseDom2BadgeList(ele) {
        const badges = ele.querySelectorAll(".badge_row.is_link");
        if (badges.length === 0) {
            return null;
        }

        const maxBadges = [];
        for (const badge of badges) {
            const url = badge.querySelector("a.badge_row_overlay")?.href;
            const level = badge.querySelector(".badge_info_description>div:nth-child(2)")?.innerText.trim() ?? "0 级";
            const title = badge.querySelector(".badge_title")?.innerText?.trim()?.split("\t")[0] ?? "Null";
            if (url && level && level.startsWith("5 级")) {
                maxBadges.push([url, title]);
            }
        }
        return maxBadges;
    }

    //读取卡牌页面
    function getCardInfo(url, title) {
        const matchUrl = url.match(MatchAppId);
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(res => res.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');

                    const cardCount = doc.querySelectorAll(".badge_card_set_text_qty");
                    const cardTotal = cardCount.length;

                    if (cardTotal === 0) { resolve([true, matchUrl[1], title, 0, 0]); }

                    let sum = 0;
                    for (let i = 0; i < cardTotal; i++) {
                        let text = cardCount[i].innerText;
                        let num = text.substring(1, text.length - 1);
                        try {
                            sum += parseInt(num);
                        } catch (e) {
                            console.error(e);
                        }
                    }

                    resolve([true, matchUrl[1], title, sum, cardTotal]);
                })
                .catch(err => {
                    console.error("请求失败", err);
                    resolve([false, matchUrl[1], null, null, null]);
                });
        });
    }
    //读取徽章页面
    async function getBadgeList(page) {
        return new Promise((resolve, reject) => {
            fetch(`${origin}${pathname}?sort=c&p=${page}&l=schinese`)
                .then(res => res.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    resolve(doc);
                })
                .catch(err => {
                    console.error("请求失败", err);
                    resolve(null);
                });
        });
    }

})();

GM_addStyle(`
.profile_small_header_text > .fec_btn {
    float: right;
  }
  .profile_small_header_text > .fec_btn {
    margin-left: 5px;
  }
  .fec_action > .fec_btn:not(:first-child) {
    margin-left: 20px;
  }
  .fec_btn {
    padding: 3px 6px;
  }
  .fec_action {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 5px;
  }
  .fec_action > .fec_btn {
    flex: 0 0 auto;
  }
  .fec_text {
    height: 300px;
    width: 600px;
    resize: vertical;
    font-size: 15px;
    margin: 5px 0;
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.4);
    color: #fff;
    border: 1 px solid #000;
    border-radius: 3 px;
    box-shadow: 1px 1px 0px #45556c;
  }
  .fec_area {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  .fec_area > * {
    width: 100%;
  }
  
`);
