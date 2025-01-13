// ==UserScript==
// @name:zh-CN      批量撤回评测点赞
// @name            Recommend_Unrate
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
// @version         1.12
// @description     批量撤回评测点赞/有趣
// @description:zh-CN  批量撤回评测点赞/有趣
// @author          Chr_
// @match           https://help.steampowered.com/zh-cn/accountdata/GameReviewVotesAndTags
// @connect         steamcommunity.com
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_addStyle
// @grant           GM_xmlhttpRequest
// ==/UserScript==


(() => {
    "use strict";

    const defaultRules = [
        "$$⠄|⢁|⠁|⣀|⣄|⣤|⣆|⣦|⣶|⣷|⣿|⣇|⣧",
        "$$我是((伞兵|傻|啥|煞|聪明|s)|(比|逼|币|b))",
        "$$(补|布)丁|和谐|去兔子",
        "$$度盘|网盘|链接|提取码",
        "$$步兵|骑兵",
        "$$pan|share|weiyun|lanzou|baidu",
        "链接已删除",
        "steam://install",
        "/s/",
    ].join("\n");

    const rateTable = document.getElementById("AccountDataTable_1");
    const tagTable = document.getElementById("AccountDataTable_2");
    const hideArea = document.createElement("div");
    const banner = document.querySelector(".feature_banner");
    const describe = document.createElement("div");
    const { script: { version } } = GM_info;
    describe.innerHTML = `
    <h4>批量撤回评测点赞 Ver ${version} By 【<a href="https://steamcommunity.com/id/Chr_" target="_blank">Chr_</a>】</h4>
    <h5>关键词黑名单设置: 【<a href="#" class="ru_default">重置规则</a>】</h5>
    <p> 1. 仅会对含有黑名单词汇的评测消赞</p>
    <p> 2. 一行一条规则, 默认为关键词模式 (评测中需要出现指定的词汇才会判断为需要消赞)</p>
    <p> 3. 以 !! 开头的规则为简易通配符模式 (比如 !!我是?? 可以匹配包含 我是xx 的评测)</p>
    <p> 4. 以 $$ 开头的规则为正则表达式模式 (比如 $$我是([啥s]|[比b]) 可以匹配包含 我是sb 的评测</p>
    <p> 5. 以 # 开头的规则将被视为注释, 不会生效</p>
    <p> 6. <b>Steam 评测是社区的重要组成部分, 请尽量使用黑名单进行消赞</b></p>
    <p> 7. 一些常用的规则参见 【<a href="https://keylol.com/t794532-1-1" target="_blank">发布帖</a>】</p>
    <p> 8. 如果需要对所有评测消赞, 请填入 !!* </p>`;

    banner.appendChild(describe);
    const filter = document.createElement('textarea');
    filter.placeholder = "黑名单规则, 一行一条, 支持 * ? 作为通配符, 支持正则表达式";
    filter.className = "ru_filter";
    const savedRules = window.localStorage.getItem("ru_rules");
    filter.value = savedRules !== null ? savedRules : defaultRules;
    const resetRule = banner.querySelector(".ru_default");
    resetRule.onclick = () => {
        ShowConfirmDialog(`⚠️操作确认`, `<div>确定要重置规则吗?</div>`, '确认', '取消')
            .done(() => { filter.value = defaultRules; })
            .fail(() => {
                const dialog = ShowDialog("操作已取消");
                setTimeout(() => { dialog.Dismiss(); }, 1000);
            });
    };
    banner.appendChild(filter);
    hideArea.style.display = "none";
    function genBtn(ele) {
        const b = document.createElement("button");
        b.innerText = "执行消赞";
        b.className = "ru_btn";
        b.onclick = async () => {
            b.disabled = true;
            b.innerText = "执行中...";
            await comfirmUnvote(ele);
            b.disabled = false;
            b.innerText = "执行消赞";
        };
        return b;
    }
    rateTable.querySelector("thead>tr>th:nth-child(1)").appendChild(genBtn(rateTable));
    tagTable.querySelector("thead>tr>th:nth-child(1)").appendChild(genBtn(tagTable));
    window.addEventListener("beforeunload", () => { window.localStorage.setItem("ru_rules", filter.value); });

    // 操作确认
    async function comfirmUnvote(ele) {
        ShowConfirmDialog(`⚠️操作确认`, `<div>即将开始进行批量消赞, 强制刷新页面可以随时中断操作</div>`, '开始消赞', '取消')
            .done(() => { doUnvote(ele); })
            .fail(() => {
                const dialog = ShowDialog("操作已取消");
                setTimeout(() => { dialog.Dismiss(); }, 1000);
            });
    }
    // 执行消赞
    async function doUnvote(ele) {
        // 获取所有规则并去重
        const rules = filter.value.split("\n").map(x => x)
            .filter((item, index, arr) => item && arr.indexOf(item, 0) === index)
            .map((x) => {
                if (x.startsWith("#")) {
                    return [0, x];
                }
                else if (x.startsWith("$$")) {
                    try {
                        return [2, new RegExp(x.substring(2), "ig")];
                    } catch (e) {
                        ShowDialog("正则表达式有误", x);
                        return [-1, null];
                    }
                }
                else if (x.startsWith("!!")) {
                    return [1, x.substring(2).replace(/\*+/g, '*')];
                }
                else if (x.includes("*") || x.includes("?")) {
                    return [1, x.replace(/\*+/g, '*')];
                }
                return [0, x];
            });
        const [, sessionID] = await fetchSessionID();
        const rows = ele.querySelectorAll("tbody>tr");

        for (const row of rows) {
            if (row.className.includes("ru_opt") || row.childNodes.length !== 4) {
                continue;
            }
            const [name, , , link] = row.childNodes;
            const url = link.childNodes[0].href;
            const [succ, recomment, id, rate] = await fetchRecommended(url);

            if (!succ) {//读取评测失败
                name.innerText += `【⚠️${recomment}】`;
                row.className += " ru_opt";
                continue;
            }

            let flag = false;
            let txt = "";
            for (const [mode, rule] of rules) {
                if (mode === 2) {// 正则模式
                    if (recomment.search(rule) !== -1) {
                        flag = true;
                        txt = rule.toString().substring(0, 8);
                        break;
                    }
                } else if (mode === 1) {//简易通配符
                    if (isMatch(recomment.replace(/\?|\*/g, ""), rule)) {
                        flag = true;
                        txt = rule.substring(0, 8);
                        break;
                    }
                } else if (mode === 0) { //关键字搜寻
                    if (recomment.includes(rule)) {
                        flag = true;
                        txt = rule.substring(0, 8);
                        break;
                    }
                }
            }
            if (flag) {//需要消赞
                const raw = name.innerText;
                name.innerText = `${raw}【❌ 命中规则  ${txt}】`;
                const succ1 = await changeVote(id, true, sessionID);
                const succ2 = await changeVote(id, false, sessionID);

                if (succ1 && succ2) {
                    name.innerText = `${raw}【💔 消赞成功 ${txt}】`;
                } else {
                    name.innerText = `${raw}【💥 消赞失败(请检查社区是否登陆)】`;
                }
            }
            else {
                name.innerText += "【💚 无需消赞】";
            }
            row.className += " ru_opt";
        }
    }
    // 获取SessionID
    function fetchSessionID() {
        return new Promise((resolve, reject) => {
            $http.getText("https://steamcommunity.com/id/Chr_/")
                .then((text) => {
                    const sid = (text.match(/g_sessionID = "(.+)";/) ?? ["", ""])[1];
                    resolve([sid !== "", sid]);
                }).catch((err) => {
                    console.error(err);
                    resolve([false, ""]);
                });
        });
    }
    // 获取评测详情
    // 返回 (状态, 评测内容, id , rate)
    function fetchRecommended(url) {
        return new Promise((resolve, reject) => {
            $http.getText(url)
                .then((text) => {
                    const area = document.createElement("div");
                    hideArea.appendChild(area);
                    area.innerHTML = text;
                    const recomment = area.querySelector("#ReviewText")?.innerText.trim() ?? "获取失败";
                    const eleVoteUp = area.querySelector("span[id^='RecommendationVoteUpBtn']");
                    const voteUp = eleVoteUp?.className.includes("btn_active");
                    const voteDown = area.querySelector("span[id^='RecommendationVoteDownBtn']")?.className.includes("btn_active");
                    const voteTag = area.querySelector("span[id^='RecommendationVoteTagBtn']")?.className.includes("btn_active");
                    const recommentID = eleVoteUp ? parseInt(eleVoteUp.id.replace("RecommendationVoteUpBtn", "")) : 0;
                    // 好评=1 差评=2 欢乐=3 未评价=0 解析失败=-1
                    const rate = voteUp ? 1 : voteDown ? 2 : voteTag ? 3 : (voteUp == null || voteDown == null || voteTag == null) ? -1 : 0;
                    hideArea.removeChild(area);
                    resolve([true, recomment, recommentID, rate]);
                }).catch((err) => {
                    console.error(err);
                    resolve([false, "未知错误", 0, 0]);
                });
        });
    }
    // 进行消赞
    function changeVote(recID, state, sessionid) {
        return new Promise((resolve, reject) => {
            let data = `tagid=1&rateup=${state}&sessionid=${sessionid}`;
            $http.post(`https://steamcommunity.com/userreviews/votetag/${recID}`, data, {
                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
            })
                .then((json) => {
                    const { success } = json;
                    resolve(success === 1);
                }).catch((err) => {
                    console.error(err);
                    resolve(false);
                });
        });
    }
    // 通配符匹配
    function isMatch(string, pattern) {
        let dp = [];
        for (let i = 0; i <= string.length; i++) {
            let child = [];
            for (let j = 0; j <= pattern.length; j++) {
                child.push(false);
            }
            dp.push(child);
        }
        dp[string.length][pattern.length] = true;
        for (let i = pattern.length - 1; i >= 0; i--) {
            if (pattern[i] != "*") {
                break;
            } else {
                dp[string.length][i] = true;
            }
        }
        for (let i = string.length - 1; i >= 0; i--) {
            for (let j = pattern.length - 1; j >= 0; j--) {
                if (string[i] == pattern[j] || pattern[j] == "?") {
                    dp[i][j] = dp[i + 1][j + 1];
                } else if (pattern[j] == "*") {
                    dp[i][j] = dp[i + 1][j] || dp[i][j + 1];
                } else {
                    dp[i][j] = false;
                }
            }
        }
        return dp[0][0];
    };
    class Request {
        'use strict';
        constructor(timeout = 3000) {
            this.timeout = timeout;
        }
        get(url, opt = {}) {
            return this.#baseRequest(url, 'GET', opt, 'json');
        }
        getText(url, opt = {}) {
            return this.#baseRequest(url, 'GET', opt, 'text');
        }
        post(url, data, opt = {}) {
            opt.data = data;
            return this.#baseRequest(url, 'POST', opt, 'json');
        }
        #baseRequest(url, method = 'GET', opt = {}, responseType = 'json') {
            Object.assign(opt, {
                url, method, responseType, timeout: this.timeout
            });
            return new Promise((resolve, reject) => {
                opt.ontimeout = opt.onerror = reject;
                opt.onload = ({ readyState, status, response, responseXML, responseText }) => {
                    if (readyState === 4 && status === 200) {
                        if (responseType === 'json') {
                            resolve(response);
                        } else if (responseType === 'text') {
                            resolve(responseText);
                        } else {
                            resolve(responseXML);
                        }
                    } else {
                        console.error('网络错误');
                        console.log(readyState);
                        console.log(status);
                        console.log(response);
                        reject('解析出错');
                    }
                };
                GM_xmlhttpRequest(opt);
            });
        }
    }
    const $http = new Request();

    GM_addStyle(`
    .feature_banner {
        background-size: cover;
      }
      .feature_banner > div{
        margin-left: 10px;
        color: #fff;
        font-weight: 200;
      }
      .ru_btn {
        margin-left: 5px;
        padding: 2px;
      }
      .ru_filter {
        resize: vertical;
        width: calc(100% - 30px);
        min-height: 80px;
        margin: 10px;
      }     
      `);
})();

