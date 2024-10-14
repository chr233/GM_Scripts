// ==UserScript==
// @name         Delete_My_Comment
// @name:zh-CN   批量删除个人资料留言
// @namespace    https://blog.chrxw.com
// @version      1.1
// @description  批量删除在别人个人资料下的留言
// @description:zh-CN  批量删除在别人个人资料下的留言
// @author       Chr_
// @include      /https://steamcommunity\.com/(id|profiles)/[^\/]+/commenthistory/?/
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_addStyle
// ==/UserScript==

(async () => {
    'use strict';

    let GObjs = {};

    addGui();

    //添加UI
    function addGui() {
        function genBtn(name, foo) {
            const b = document.createElement('button');
            b.textContent = name;
            b.className = 'dmc_btn';
            b.addEventListener('click', foo);
            return b;
        }
        function genDiv(cls) {
            const d = document.createElement('div');
            d.className = cls ?? 'dmc_div';
            return d;
        }
        function genText() {
            const t = document.createElement('textarea');
            t.className = 'dmc_txt';
            return t;
        }
        function genNum() {
            const t = document.createElement('input');
            t.type = 'number';
            t.value = 0;
            t.min = 0;
            t.className = 'dmc_ipt';
            return t;
        }
        function genSpan(txt) {
            const t = document.createElement('span');
            t.textContent = txt;
            t.className = 'dmc_span';
            return t;
        }

        const rightDiv = document.querySelector("div.rightbox");
        const divArea = genDiv('dmc_panel');
        const btnStart = genBtn('开始删除', async () => {
            const startPage = parseInt(iptPage.value);
            if (startPage !== startPage) {
                ShowAlertDialog("错误", "只能输入整数");

            } else {
                const endPage = getPageCount();
                try {
                    btnStart.textContent = '执行中';
                    btnStart.disabled = true;
                    await startDeleteComments(startPage, endPage);
                }
                finally {
                    btnStart.textContent = '开始删除';
                    btnStart.disabled = false;
                }
            }
        });
        const iptPage = genNum();
        const txtLog = genText();
        const divHide = genDiv('dmc_hide');
        rightDiv.appendChild(divArea);
        divArea.appendChild(btnStart);
        divArea.appendChild(genSpan('开始页码:'));
        divArea.appendChild(iptPage);
        divArea.appendChild(txtLog);
        divArea.appendChild(divHide);
        Object.assign(GObjs, { txtLog, divHide });
    }

    //批量删除留言
    async function startDeleteComments(startPage, endPage) {
        const { divHide, txtLog } = GObjs;
        const genTmp = () => {
            const d = document.createElement('div');
            divHide.appendChild(d);
            return d;
        };
        const log = (msg) => {
            if (txtLog.value) {
                txtLog.value += "\n";
            }
            txtLog.value += msg;
            txtLog.scrollTop = txtLog.scrollHeight;
        };
        log(`1 开始运行, 页码设置: ${startPage} / ${endPage}`);
        const baseUri = location.origin + location.pathname;

        for (let i = startPage; i <= endPage; i++) {
            log(`2 开始读取第 ${i} 页历史记录`);
            const historyUrl = `${baseUri}?p=${i}`;
            const response = await loadPage(historyUrl);
            if (response) {
                const tmp = genTmp();
                tmp.innerHTML = response;
                const links = fetchCommentFromHistory(tmp);
                divHide.removeChild(tmp);

                const count = links.length;
                if (count > 0) {
                    log(`3 获取了 ${links.length} 条留言记录`);

                    for (let link of links) {
                        log('4 开始读取留言');
                        const resp = await loadPage(link);
                        if (response) {
                            const ss = genTmp();
                            ss.innerHTML = resp;
                            const rst = fetchProfileComments(ss);

                            const tasks = [];
                            const gids = new Set();

                            const cnt = rst.length;
                            if (cnt > 0) {
                                log(`5 获取了 ${cnt} 条留言记录`);

                                for (let [steamid, gid] of rst) {
                                    if (!gids.has(gid)) {
                                        gids.add(gid);
                                        tasks.push(makePromise(steamid, gid));
                                    }
                                }

                                if (tasks.length > 0) {
                                    log(`5 总计 ${tasks.length} 条留言, 开始删除`);
                                    await Promise.all(tasks);
                                } else {
                                    log('5 未找到可以删除的留言');
                                }

                            } else {
                                log('5 未找到留言记录');
                            }
                            divHide.removeChild(ss);
                        }
                        else {
                            log('4 读取失败');
                        }
                    }
                }
                else {
                    log('3 无留言记录,跳过');
                }
            } else {
                log('2 读取失败');
            }
        }

        log('1 运行结束');

        function makePromise(steamid, gid) {
            return new Promise((resolve, reject) => {
                deleteComment(steamid, gid)
                    .then(() => {
                        log(`> 删除留言 ${gid} 成功`);

                    }).catch((reason) => {
                        log(`> 删除留言 ${gid} 失败`);

                    }).finally(() => {
                        resolve();
                    });
            });
        }
    }

    //获取总页数
    function getPageCount() {
        const pages = document.querySelectorAll("div.pageLinks>a.pagelink");
        if (pages.length === 0) {
            return 0;
        } else {
            const lastPage = parseInt(pages[pages.length - 1].textContent.replace(/[,.]/g, ""));
            return lastPage === lastPage ? lastPage : 0;
        }
    }

    //获取历史留言记录
    function fetchCommentFromHistory(element) {
        const comments = element.querySelectorAll("div.commenthistory_comment:not(.deleted) a");
        const matchLinks = new RegExp(/https:\/\/steamcommunity\.com\/(id|profiles)\/[^\/]+\/?\?tscn=\d+$/g);
        const result = [];
        for (let comment of comments) {
            const href = comment.href;
            if (matchLinks.test(href)) {
                result.push(href);
            }
        }
        return result;
    }

    // 读取网页
    async function loadPage(href) {
        return new Promise((resolve, reject) => {
            fetch(href, {
                method: "GET",
                credentials: "include",
            })
                .then(async (response) => {
                    if (response.ok) {
                        const data = await response.text();
                        resolve(data.trim());
                    } else {
                        resolve(null);
                    }
                }).catch((err) => {
                    console.error(err);
                    resolve(null);
                });
        });
    }

    // 匹配所有自己的留言
    function fetchProfileComments(element) {
        const comments = element.querySelectorAll("a.actionlink:not(.report_and_hide)");
        const matchLinks = new RegExp(/'(\S+)'/g);
        const result = [];
        for (let comment of comments) {
            const href = comment.href;
            const match = href.match(matchLinks);
            if (match && match.length >= 2) {
                const steamId = match[0].replace("Profile_", "").replace(/'/g, "");
                const commentId = match[1].replace(/'/g, "");
                result.push([steamId, commentId]);
            }
        }
        return result;
    }

    const SessionId = document.cookie.replace(/(?:(?:^|.*;\s*)sessionid\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    // 删除指定留言
    async function deleteComment(steamId, gidComment) {
        const data = {
            "gidcomment": gidComment,
            "start": 0,
            "count": 6,
            "sessionid": SessionId,
            "feature2": -1,
            "lastvisit": 0
        };
        let s = '';
        for (let k in data) {
            s += `${k}=${data[k]}&`;
        }
        return new Promise((resolve, reject) => {
            fetch(`https://steamcommunity.com/comment/Profile/delete/${steamId}/-1/`, {
                method: "POST",
                credentials: "include",
                body: s,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                },
            })
                .then(async (response) => {
                    if (response.ok) {
                        const data = await response.json();
                        const result = data.success ?? false;
                        resolve(result);
                    } else {
                        resolve(false);
                    }
                }).catch((err) => {
                    reject(err);
                });
        });
    }

    GM_addStyle(`
    .dmc_panel {
        padding: 15px;
      }
      
      .dmc_span {
        margin-left: 10px;
        margin-right: 10px;
      }
      
      .dmc_ipt {
        text-align: center;
        width: 50px;
      }
      
      .dmc_txt {
        margin-top: 10px;
        width: 100%;
        height: 300px;
      }
      
      .dmc_hide {
        display: none;
      }
      
`);

})();

