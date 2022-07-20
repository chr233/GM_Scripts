
// ==UserScript==
// @name:zh-CN   帖子导出工具
// @name         Posts_Dumper
// @namespace    https://blog.chrxw.com
// @version      1.4
// @description:zh-CN  导出帖子内容到数据库
// @description  导出帖子内容到数据库
// @author       Chr_
// @match        https://keylol.com/*
// @match        https://dev.keylol.com/*
// @connect      127.0.0.1
// @connect      store.steampowered.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// ==/UserScript==

setTimeout(async () => {
    'use strict';

    const port = 8000;
    const host = '127.0.0.1';

    const matchTid = new RegExp(/(?:t|tid=)(\d+)/);

    const treadList = document.querySelector("#threadlisttableid");

    if (treadList !== null) {//获取帖子列表

        function genBtn(name, foo) {
            const b = document.createElement('button');
            b.textContent = name;
            b.className = 'pd_btn';
            b.addEventListener('click', foo);
            return b;
        }
        function genDiv(cls) {
            const d = document.createElement('div');
            d.className = cls ?? 'pd_div';
            return d;
        }
        function genSpan(text) {
            const s = document.createElement('span');
            s.textContent = text;
            return s;
        }
        function genHr() {
            const b = document.createElement('hr');
            return b;
        }
        function genBr() {
            const b = document.createElement('br');
            return b;
        }
        function genIframe() {
            const i = document.createElement('iframe');
            return i
        }
        function genText() {
            const t = document.createElement('input');
            t.placeholder = '帖子ID';
            t.className = 'pd_text';
            return t;
        }

        const panel = genDiv('pd_panel');

        const tempIframe = genIframe();
        const tempIframe2 = genIframe();
        const tempIframe3 = genIframe();

        const tempIFrames = [tempIframe, tempIframe2, tempIframe3];

        const status = await testBackend();

        const statusTips = genSpan(status ? '连接成功' : '连接失败');

        const btnGrubNew = genBtn('抓取尚未记录的', async () => {
            const postLists = treadList.querySelectorAll("th.common>a.pd_not_added.xst,th.new>a.pd_not_added.xst,th.lock>a.pd_not_added.xst");
            const total = postLists.length;
            if (total > 0) {
                statusTips.textContent = `开始抓取,共 ${total} 篇`;
                const workTread = tempIFrames.length;
                for (let i = 0; i < total; i += workTread) {
                    const max = Math.min(i + workTread, total)
                    const tasks = [];
                    for (let j = i; j < max; j++) {
                        const postTag = postLists[j];
                        const tid = grubTid(postTag.href);
                        const url = genUrl(tid) + '?utm=114514';
                        tempIFrames[j - i].src = url;
                        postTag.classList.remove('pd_not_added');
                        postTag.classList.add('pd_done');
                        tasks.push(waitUnitlDone(tid));
                    }

                    await Promise.all(tasks);

                    statusTips.textContent = `抓取进度 ${max}/${total}`;
                }
                statusTips.textContent = '抓取结束';
            } else {
                statusTips.textContent = '没有可以抓取的帖子';
            }
            await freshPostList();
        });

        const btnGrubAll = genBtn('抓取所有', async () => {
            const postLists = treadList.querySelectorAll("th.common>a.xst,th.new>a.xst,th.lock>a.xst");
            const total = postLists.length;
            if (total > 0) {
                statusTips.textContent = `开始抓取,共 ${total} 篇`;
                const workTread = tempIFrames.length;
                for (let i = 0; i < total; i += workTread) {
                    const max = Math.min(i + workTread, total)
                    const tasks = [];
                    for (let j = i; j < max; j++) {
                        const postTag = postLists[j];
                        const tid = grubTid(postTag.href);
                        const url = genUrl(tid) + '?utm=114514';
                        tempIFrames[j - i].src = url;
                        postTag.classList.remove('pd_not_added');
                        postTag.classList.add('pd_done');
                        tasks.push(waitUnitlDone(tid));
                    }

                    await Promise.all(tasks);

                    statusTips.textContent = `抓取进度 ${max}/${total}`;
                }
                statusTips.textContent = '抓取结束';
            } else {
                statusTips.textContent = '没有可以抓取的帖子';
            }
            await freshPostList();
        });

        const txtTid = genText();
        const btnGrubOne = genBtn('手动抓取', async () => {

            const tid = parseInt(txtTid.value);
            if (!(tid > 0)) {
                alert('请输入整数 TID');
                return;
            }
            statusTips.textContent = `TID ${tid} 开始抓取`;
            const url = genUrl(tid) + '?utm=114514';
            tempIframe.src = url;
            const result = await waitUnitlDone(tid);
            postTag.classList.remove('pd_not_added');
            postTag.classList.remove('pd_added');
            postTag.classList.add('pd_done');
            statusTips.textContent = `TID ${tid} ${result}`;

            await freshPostList();
        });

        const btnExportExcel = genBtn('导出Excel', () => {
            window.open(`http://${host}:${port}/api/excel`)
        });

        const btnExportBBCode = genBtn('导出BBCode', () => {
            window.open(`http://${host}:${port}/api/bbcode`)
        });

        const btnResetDB = genBtn('重置数据库(删除所有数据)', async () => {
            if (confirm('真的要删除所有数据吗?')) {
                await deleteAllData();
            }
        });

        const btnControl = genBtn('在管理面板浏览数据', () => {
            window.open(`http://${host}:${port}/index.html`);
        });

        panel.appendChild(statusTips);
        panel.appendChild(genHr());

        if (status) {
            panel.appendChild(btnGrubNew);
            panel.appendChild(btnGrubAll);
            panel.appendChild(genHr());
            panel.appendChild(txtTid);
            panel.appendChild(btnGrubOne);
            panel.appendChild(genHr());
            panel.appendChild(btnExportExcel);
            panel.appendChild(btnExportBBCode);
            panel.appendChild(genHr());
            panel.appendChild(btnResetDB);
            panel.appendChild(genHr());
            panel.appendChild(btnControl);
            panel.appendChild(genHr());
            panel.appendChild(tempIframe);
            panel.appendChild(genBr());
            panel.appendChild(tempIframe2);
            panel.appendChild(genBr());
            panel.appendChild(tempIframe3);

            document.getElementById('autopbn').addEventListener('click', async () => {
                setTimeout(async () => {
                    await freshPostList();
                }, 500);
            });

            //判断是否已抓取
            await freshPostList();
        }
        else {
            panel.appendChild(genSpan('请检查软件是否运行以及端口是否被占用'));

            setTimeout(() => {
                panel.style.display = 'none';
            }, 3000);
        }

        document.body.appendChild(panel);

    } else if (ifNeedGrub()) {//抓取帖子内容
        const tid = grubTid(location.href);
        const post_url = genUrl(tid);
        const post_title = document.getElementById('thread_subject')?.textContent ?? '获取失败';
        const eleAuthor = document.querySelector('div.pi>div.authi>a.xw1');
        const author_nick = eleAuthor?.textContent ?? '获取失败';
        const author_uid = eleAuthor?.href.replace('https://keylol.com/suid-', '') ?? '获取失败';
        const post_date = document.querySelector('div.pti>div.authi>em[id]')?.textContent.substring(4) ?? '获取失败';
        const eleContent = document.querySelector('td[id^=postmessage');
        const nodes = eleContent?.childNodes ?? [];
        const contentLines = [];

        function node2text(node) {
            switch (node.nodeName) {
                case 'I':
                case 'A':
                case 'IFRAME':
                case 'STYLE':
                case 'SCRIPT':
                case 'IMG':
                    return;
                case "DIV":
                    if (node.classList.contains('aimg_tip')) {
                        return;
                    }
            }

            if (node.nodeType === Node.TEXT_NODE) {
                const raw = node.textContent?.trim();
                if (raw && raw.length > 2 && raw.search('未经许可，严禁转载') === -1) {
                    contentLines.push(raw);
                }
            }
            else {
                if (node.childNodes?.length > 0) {
                    for (let child of node.childNodes) {
                        node2text(child);
                    }
                }
            }
        }

        for (let node of nodes) {
            node2text(node);
        }
        const content = contentLines.join('\n');

        const steamLinks = document.querySelectorAll("a[href^='https://store.steampowered.com/'],a[href^='https://steamdb.info/app/']");
        const grubAppid = new RegExp(/app\/(\d+)\/?/);
        const appIDsSet = new Set();
        for (const ele of steamLinks) {
            const href = ele.href;
            if (href) {
                const appID = parseInt(grubAppid.exec(href)?.[1] ?? 0);
                if (appID > 0) {
                    appIDsSet.add(appID);
                }
            }
        }

        const appIDs = [...appIDsSet];
        const bbcodes = [];
        const excels = [];

        const tasks = [];
        for (let appid of appIDs) {
            tasks.push(getGameName(appid));
        }

        const values = await Promise.all(tasks);

        for (let [succ, name, appid] of values) {
            if (!succ) {
                name = `【${name ?? '读取出错'}】`;
            }
            bbcodes.push(`[url=https://store.steampowered.com/app/${appid}/]${name}[/url]`);
            excels.push(`${name} https://store.steampowered.com/app/${appid}/`);
        }

        const game_list = appIDs.join(' | ');
        const game_bbcode = bbcodes.join('\n');
        const game_excel = excels.join('\r\n');
        const data = { tid, post_url, post_title, author_nick, author_uid, post_date, content, game_list, game_bbcode, game_excel };
        console.log(data);
        try {
            GM_setValue(tid, '抓取完成');
            await savePostData(data);
        }
        catch (error) {
            GM_setValue(tid, error);
        }
    }

    //显示是否已经抓取
    async function freshPostList() {
        const tidSet = await getPostIds();
        const postLists = treadList.querySelectorAll("th.common>a.xst,th.new>a.xst,th.lock>a.xst");
        for (let postTag of postLists) {
            const tid = grubTid(postTag.href);

            postTag.classList.remove('pd_not_added');
            postTag.classList.remove('pd_added');
            postTag.classList.remove('pd_done');

            if (tidSet.has(tid)) {
                postTag.classList.add('pd_added');
                postTag.title = '【已抓取】';
            } else {
                postTag.classList.add('pd_not_added');
                postTag.title = '【未抓取】';
            }
        }
    }

    //判断是否需要抓取
    function ifNeedGrub() {
        if (location.search.endsWith('utm=114514')) {
            return matchTid.test(location.href) >= 0;
        } else {
            return false;
        }
    }

    //提取tid
    function grubTid(url) {
        return matchTid.exec(url)?.[1] ?? url.match(matchTid);
    }

    //生成链接
    function genUrl(tid) {
        return `https://keylol.com/t${tid}-1-1`;
    }

    //-----------------------------------
    //检测后台连通性
    function testBackend() {
        return new Promise((resolve, reject) => {
            $http.get(`http://${host}:${port}/api/test`)
                .then((response) => {
                    resolve(response?.code === 666)
                })
                .catch((reason) => {
                    resolve(false);
                });
        });
    }
    //检测是否抓取完成
    function waitUnitlDone(tid) {
        return new Promise((resolve, reject) => {
            let t1, t2;

            t1 = setInterval(() => {
                const fin = GM_getValue(tid);
                if (fin) {
                    clearInterval(t1);
                    clearInterval(t2);
                    GM_deleteValue(tid);
                    resolve(fin);
                }
            }, 50);

            t2 = setTimeout(() => {
                clearInterval(t1);
                GM_deleteValue(tid);
                resolve('操作超时');
            }, 10000);
        });
    }
    //获取已抓取的帖子tid列表
    function getPostIds() {
        return new Promise((resolve, reject) => {
            $http.get(`http://${host}:${port}/api/posts/ids`)
                .then((response) => {
                    const tidSet = new Set();
                    if (response?.code !== 0) {
                        console.error(response?.msg ?? '消息为空');
                    } else {
                        const data = response?.data ?? [];
                        for (let o of data) {
                            tidSet.add(o);
                        }
                    }
                    resolve(tidSet);
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }
    //上传抓取结果
    function savePostData(data) {
        return new Promise((resolve, reject) => {
            $http.post(`http://${host}:${port}/api/post`, JSON.stringify(data))
                .then((response) => {
                    console.log(response);
                    resolve(response?.code !== 0);
                })
                .catch((reason) => {
                    console.log(reason);
                    resolve(false);
                });
        });
    }
    //删除所有数据
    function deleteAllData() {
        return new Promise((resolve, reject) => {
            $http.delete(`http://${host}:${port}/api/posts`)
                .then((response) => {
                    console.log(response);
                    resolve(response?.code !== 0);
                })
                .catch((reason) => {
                    console.log(reason);
                    resolve(false);
                });
        });
    }
    //获取游戏名
    function getGameName(appid) {
        return new Promise((resolve, reject) => {
            $http.get(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=schinese`)
                .then((response) => {
                    const { success, data } = response[appid];
                    resolve([success, data['name'], appid]);
                })
                .catch((reason) => {
                    console.log(reason);
                    resolve(false, reason, appid);
                });
        });
    }
}, 500);
//-----------------------------------
class Request {
    'use strict';
    constructor(timeout = 3000) {
        this.timeout = timeout;
    }
    get(url, opt = {}) {
        return this.#baseRequest(url, 'GET', opt, 'json');
    }
    getHtml(url, opt = {}) {
        return this.#baseRequest(url, 'GET', opt, '');
    }
    getText(url, opt = {}) {
        return this.#baseRequest(url, 'GET', opt, 'text');
    }
    post(url, data, opt = {}) {
        opt.data = data;
        opt.headers = {
            "Content-Type": "application/json"
        }
        return this.#baseRequest(url, 'POST', opt, 'json');
    }
    delete(url, opt = {}) {
        return this.#baseRequest(url, 'DELETE', opt, 'json');
    }
    #baseRequest(url, method = 'GET', opt = {}, responseType = 'json') {
        Object.assign(opt, {
            url, method, responseType, timeout: this.timeout
        });
        return new Promise((resolve, reject) => {
            opt.ontimeout = opt.onerror = reject;
            opt.onload = ({ readyState, status, response, responseXML, responseText }) => {
                if (readyState === 4 && status === 200) {
                    if (responseType == 'json') {
                        resolve(response);
                    } else if (responseType == 'text') {
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
            }
            GM_xmlhttpRequest(opt);
        });
    }
}
const $http = new Request();

//CSS表
GM_addStyle(`
.pd_div {
    vertical-align: middle;
  }
  
  .pd_panel {
    background: rgba(58, 58, 58, 0.5);
    position: fixed;
    top: 50%;
    right: 0px;
    text-align: center;
    transform: translate(0px, -50%);
    z-index: 100;
    padding: 5px;
    border-radius: 5px 0 0 5px;
  }
  
  .pd_panel > *:not(:last-child) {
    margin-right: 5px;
  }
  
  .pd_panel > hr {
    margin: 5px 0 5px;
  }
  
  .pd_panel > span {
    color: #fff;
  }
  
  .pd_panel > iframe {
    width: 200px;
    height: 50px;
  }
  
  .pd_added::before {
    content: "✅";
  }
  
  .pd_not_added::before {
    content: "❌";
  }
  
  .pd_done::before {
    content: "🤔";
  }
  
  .pd_text {
    width: 90px;
    text-align: center;
  }
`);