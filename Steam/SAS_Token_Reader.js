// ==UserScript==
// @name         SAS_Token_Reader
// @name:zh-CN   SAS_获取Token
// @namespace    https://blog.chrxw.com
// @version      1.5
// @description  Steam获取打赏Token
// @description:zh-CN  Steam获取打赏Token
// @author       Chr_
// @include      /https://steamcommunity\.com/(id|profiles)/[^\/]+/?$/
// @connect      steampowered.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==

(() => {
    'use strict';
    //机器人账号
    let GBots = {};

    loadConf();

    graphGUI();
    flashList();

    panelSwitch();

    saveConf();

    //-----------------------------------
    //添加控制面板
    function graphGUI() {
        function genButton(text, foo, id = null, cls = 'aam_button') {
            let b = document.createElement('button');
            b.textContent = text;
            b.className = cls;
            b.addEventListener('click', foo);
            if (id) { b.id = id; }
            return b;
        }
        function genDiv(id = null, cls = 'aam_div') {
            let d = document.createElement('div');
            d.className = cls;
            if (id) { d.id = id };
            return d;
        }
        function genLabel(text, bind = null, cls = 'aam_label') {
            let l = document.createElement('label');
            l.textContent = text;
            l.className = cls;
            if (bind) { l.setAttribute('for', bind); }
            return l;
        }
        function genA(text, url, cls = 'aam_a') {
            let a = document.createElement('a');
            a.textContent = text;
            a.className = cls;
            a.href = url;
            return a;
        }
        function genInput(id, value, tips, number = false) {
            let i = document.createElement('input');
            i.id = id;
            if (value) { i.value = value; }
            if (tips) { i.placeholder = tips; }
            if (number) {
                i.type = 'number';
                i.step = 0.01;
                i.min = 0;
            }
            return i;
        }
        function genSelect(id, choose = [], choice = null, cls = 'aam_select') {
            let s = document.createElement('select');
            s.id = id;
            s.className = cls;
            choose.forEach(([text, value]) => {
                s.options.add(new Option(text, value));
            });
            if (choice) { s.value = choice; }
            return s;
        }
        function genList(id, choose = [], choice = null, cls = 'aam_list', size = 10) {
            let s = genSelect(id, choose, choice, cls);
            s.setAttribute('multiple', 'multiple');
            s.size = size;
            return s;
        }
        function genP(text = '    ', id = null) {
            let p = document.createElement('p');
            if (id) { p.id = id; }
            p.textContent = text;
            return p;
        }
        function genSpan(text = '    ') {
            let s = document.createElement('span');
            s.textContent = text;
            return s;
        }
        const genSpace = genSpan;

        function genBr() {
            return document.createElement('br');
        }
        function genHr() {
            return document.createElement('hr');
        }
        function genMidBtn(text, foo) {
            let a = document.createElement('a');
            let s = genSpan(text);
            a.className = 'btn_profile_action btn_medium';
            a.addEventListener('click', foo);
            s.id = 'aam_switch';
            a.appendChild(s);
            return a;
        }

        let bSwitch = genMidBtn('⭕', panelSwitch);
        let btnArea = document.querySelector('.profile_header_actions');
        btnArea.appendChild(genSpace());
        btnArea.appendChild(bSwitch);
        btnArea.appendChild(genSpace());

        let panelArea = document.querySelector('div.profile_leftcol');
        let panelMain = genDiv('AAM_Panel', 'aam_panel profile_customization');
        panelMain.style.display = 'none';
        panelArea.insertBefore(panelMain, panelArea.firstChild);

        let busyPanel = genDiv('AAM_Busy', 'aam_busy');
        let busyPanelContent = genDiv(null, 'aam_busy_content');

        let busyMessage = genP('操作进行中……', 'AAM_Busy_Msg');
        let busyImg = new Image();
        busyImg.src = 'https://steamcommunity-a.akamaihd.net/public/images/login/throbber.gif';

        busyPanelContent.appendChild(busyMessage);
        busyPanelContent.appendChild(busyImg);

        busyPanel.appendChild(busyPanelContent);

        panelMain.appendChild(busyPanel);

        let accountPanel = genDiv(null, 'aam_account');
        let accountTitle = genSpan('【机器人账户管理】');

        let accountList = genList('AAM_Bots', [], null);
        accountList.addEventListener('change', accountSelect);

        let accountBtns = genDiv(null, 'aam_account_btns');

        let acAdd = genButton('添加当前账号', accountAdd);
        let acDel = genButton('删除选中', accountDel);
        let acUpdate = genButton('刷新所有账号点数', flashAllAccounts);
        let acDump = genButton('导出所有账号', dumpAllAccounts);

        accountBtns.appendChild(acAdd);
        accountBtns.appendChild(acDel);
        accountBtns.appendChild(acUpdate);
        accountBtns.appendChild(acDump);

        accountPanel.appendChild(accountTitle);
        accountPanel.appendChild(accountList);
        accountPanel.appendChild(accountBtns);

        panelMain.appendChild(accountPanel)

        let detailPanel = genDiv(null, 'aam_detail');

        let dtLblNick = genSpan('账户名:');
        let dtIptNick = genInput('AAM_Nick', '', '账户名', false);
        let dtBtnNick = genButton('复制', () => { setClipboard(dtIptNick.value) }, null, null);

        let dtLblSteamID = genSpan('SteamID:');
        let dtIptSteamID = genInput('AAM_SteamID', '', 'SteamID', false);
        let dtBtnSteamID = genButton('复制', () => { setClipboard(dtIptSteamID.value) }, null, null);

        let dtLblToken = genSpan('Access Token:');
        let dtIptToken = genInput('AAM_Token', '', 'Access Token', false);
        let dtBtnToken = genButton('复制', () => { setClipboard(dtIptToken.value) }, null, null);

        let dtLblPoints = genSpan('点数余额:');
        let dtIptPoints = genInput('AAM_Points', '', '可用点数', false);
        let dtBtnPoints = genButton('刷新', flashSingleAccounts, null, null);

        detailPanel.appendChild(dtLblNick);
        detailPanel.appendChild(genBr());
        detailPanel.appendChild(dtIptNick);
        detailPanel.appendChild(dtBtnNick);
        detailPanel.appendChild(genBr());

        detailPanel.appendChild(dtLblSteamID);
        detailPanel.appendChild(genBr());
        detailPanel.appendChild(dtIptSteamID);
        detailPanel.appendChild(dtBtnSteamID);
        detailPanel.appendChild(genBr());

        detailPanel.appendChild(dtLblToken);
        detailPanel.appendChild(genBr());
        detailPanel.appendChild(dtIptToken);
        detailPanel.appendChild(dtBtnToken);
        detailPanel.appendChild(genBr());

        detailPanel.appendChild(dtLblPoints);
        detailPanel.appendChild(genBr());
        detailPanel.appendChild(dtIptPoints);
        detailPanel.appendChild(dtBtnPoints);

        panelMain.appendChild(detailPanel);
    }
    //面板显示开关
    function panelSwitch() {
        const panel = document.getElementById('AAM_Panel');
        const btnTxt = document.getElementById('aam_switch');
        if (panel.style.display == 'none') {
            panel.style.display = '';
            btnTxt.textContent = '🔴';
        } else {
            panel.style.display = 'none';
            btnTxt.textContent = '⭕';
        }
    }

    //添加账户
    function accountAdd() {
        // const nick = document.getElementById('account_pulldown').textContent.trim();
        let v_nick, v_token, v_steamID;

        loadScreen(true);
        getSteamID()
            .then(({ nick, steamID }) => {
                v_nick = nick;
                v_steamID = steamID;
                return getToken();
            })
            .then((tk) => {
                v_token = tk;
                return getPoints(v_steamID, tk);
            })
            .then((points) => {
                showAlert('成功', `添加账户成功\n当前账户可用点数: ${points}`, true);

                GBots[v_steamID] = { nick: v_nick, token: v_token, points }
                saveConf();
                flashList();
            })
            .catch((reason) => {
                showAlert('错误', reason, false);
            }).finally(() => {
                loadScreen(false);
            });
    }
    //删除账户
    function accountDel() {
        let accounts = document.getElementById('AAM_Bots');
        for (let opt of accounts.selectedOptions) {
            delete GBots[opt.value];
        }
        flashList();
        saveConf();
    }
    //刷新账户点数
    async function flashAllAccounts() {
        let count = 0, fin = 0;
        for (let _ in GBots) {
            count++;
        }

        function makePromise(sid, tk) {
            return new Promise((resolve, reject) => {
                getPoints(sid, tk)
                    .then((points) => {
                        GBots[sid].points = points;
                        loadScreen(true, `当前进度： ${++fin} / ${count}`);
                    }).catch((reason) => {
                        GBots[sid].points = -1;
                        GBots[sid].nick = '读取失败';
                        loadScreen(true, `${sid} 更新出错： ${reason}`);
                    }).finally(() => {
                        saveConf();
                        resolve();
                    });
            });
        }

        if (count > 0) {
            loadScreen(true);

            let pList = [];

            for (let steamID in GBots) {
                const { token } = GBots[steamID];
                pList.push(makePromise(steamID, token));
            }

            Promise.all(pList)
                .finally(() => {
                    loadScreen(false);
                    flashList();
                    if (fin >= count) {
                        showAlert('完成', '所有数据刷新完毕', true);
                    } else {
                        showAlert('完成', '部分数据刷新失败,如果点数显示为【-1】,代表数据刷新失败', true);
                    }
                })

        } else {
            showAlert('错误', '机器人列表为空', false);
        }
    }
    //刷新当前账户点数
    function flashSingleAccounts() {
        let botList = document.getElementById('AAM_Bots');
        let iptSteamID = document.getElementById('AAM_SteamID');
        let iptToken = document.getElementById('AAM_Token');
        let iptPoints = document.getElementById('AAM_Points');
        let index = botList.selectedIndex;

        if (index != -1) {
            loadScreen(true);
            let steamID = botList.options[index].value;
            const { token } = GBots[steamID];
            getPoints(steamID, token)
                .then((points) => {
                    GBots[steamID].points = points;
                    showAlert('成功', `当前账户可用点数: ${points}`, true);
                }).catch((reason) => {
                    GBots[steamID].points = -1;
                    showAlert('错误', reason, false);
                }).finally(() => {
                    let points = GBots[steamID].points;
                    iptSteamID.value = steamID;
                    iptToken.value = token;
                    iptPoints.value = points;
                    loadScreen(false);
                    saveConf();
                    flashList();
                });
        } else {
            showAlert('错误', '未选中账户', false);
        }
    }
    //导出所有账户
    function dumpAllAccounts() {
        let data = [];
        for (let steamID in GBots) {
            const { token, nick } = GBots[steamID];
            data.push(`${steamID}, ${token}, ${nick}`);
        }
        setClipboard(data.join('\n'));
        showAlert('成功', '已复制到剪贴板', true);
    }
    //选择账户
    function accountSelect() {
        let botList = document.getElementById('AAM_Bots');
        let iptNick = document.getElementById('AAM_Nick');
        let iptSteamID = document.getElementById('AAM_SteamID');
        let iptToken = document.getElementById('AAM_Token');
        let iptPoints = document.getElementById('AAM_Points');
        let index = botList.selectedIndex;
        if (index != -1) {
            let steamID = botList.options[index].value;
            const { nick, token, points } = GBots[steamID];
            iptNick.value = nick;
            iptSteamID.value = steamID;
            iptToken.value = token;
            iptPoints.value = points;
        } else {
            iptNick.value = '';
            iptSteamID.value = '';
            iptToken.value = '';
            iptPoints.value = '';
        }
    }


    function flashList() {
        const botList = document.getElementById('AAM_Bots');
        botList.options.length = 0;

        let i = 1;

        for (let steamID in GBots) {
            const { nick, points } = GBots[steamID];
            botList.options.add(new Option(`${i++} | ${nick} | ${steamID} | ${points}`, steamID));
        }

    }

    //显示提示
    function showAlert(title, text, succ = true) {
        ShowAlertDialog(`${succ ? '✅' : '❌'}${title}`, text);
    }
    //读取设置
    function loadConf() {
        const bots = GM_getValue('bots');
        GBots = isEmptyObject(bots) ? {} : bots;
    }
    //保存设置
    function saveConf() {
        GM_setValue('bots', GBots);
    }
    //是不是空对象
    function isEmptyObject(obj) {
        for (var _ in obj) { return false; }
        return true;
    }
    //显示加载面板
    function loadScreen(show = true, msg = '操作进行中……') {
        const busy = document.getElementById('AAM_Busy');
        if (show) {
            busy.style.opacity = '1';
            busy.style.visibility = 'visible';
            if (msg) {
                document.getElementById('AAM_Busy_Msg').textContent = msg;
            }
        } else {
            busy.style.opacity = '0';
            busy.style.visibility = 'hidden';
        }
    }
    //复制内容
    function setClipboard(data) {
        GM_setClipboard(data, { type: 'text', mimetype: 'text/plain' });
    }


    //-----------------------------------
    function getSteamID() {
        return new Promise((resolve, reject) => {
            $http.getText('https://store.steampowered.com/account/?l=english')
                .then((text) => {
                    let match1 = text.match(/pageheader">([\s\S]+)'s account/);
                    let match2 = text.match(/Steam ID: (\d+)/);

                    if (match1 && match2) {
                        resolve({ nick: match1[1], steamID: match2[1] });
                    } else {
                        reject('【STEAM商店】未登录,请重新登录');
                    }
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }
    function getToken() {
        return new Promise((resolve, reject) => {
            $http.get('https://store.steampowered.com/pointssummary/ajaxgetasyncconfig')
                .then(({ data }) => {
                    if (isEmptyObject(data)) {
                        reject('【STEAM商店】未登录,请重新登录');
                    }
                    resolve(data.webapi_token);
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }
    function getPoints(steamID, token) {
        return new Promise((resolve, reject) => {
            $http.get(`https://api.steampowered.com/ILoyaltyRewardsService/GetSummary/v1/?access_token=${token}&steamid=${steamID}`)
                .then(({ response }) => {
                    if (isEmptyObject(response)) {
                        reject('【STEAM商店】未登录,请重新登录');
                    }
                    try {
                        let points = response.summary.points;
                        resolve(points);
                    } catch (e) {
                        reject('解析数据失败,可能是Token失效或者网络错误');
                    }
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }
})();
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
.aam_panel {
    padding: 10px;
    align-items: center;
    display: flex;
  }
  .aam_panel > div {
    justify-content: center;
  }
  .aam_busy {
    width: 100%;
    height: 100%;
    z-index: 999;
    position: absolute;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.7);
    display: table;
    visibility: hidden;
    opacity: 0;
    transition: all 0.1s;
  }
  .aam_busy_content {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
  }
  .aam_account {
    width:400px;
  }
  .aam_account > * {
    width: 100%;
    margin-bottom: 2px;
  }
  .aam_account_btns > * {
    margin-right: 2px;
  }
  
`);