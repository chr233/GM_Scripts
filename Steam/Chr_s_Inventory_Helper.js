// ==UserScript==
// @name         Chr_'s_Inventory_Helper
// @name:zh-CN   Steam库存批量出售By Chr_
// @namespace    https://blog.chrxw.com
// @version      2.2
// @description  Steam库存批量出售
// @author       Chr_
// @include      /https://steamcommunity\.com/(id|profiles)/[^\/]+/inventory/?/
// @connect      steamcommunity.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

let Vver = '2.3';     // 版本号
// 上面的开关
let VAutoR = false;   // 定时刷新开关
let VTime = 30;       // 定时刷新间隔
let VFailR = false;   // 出错刷新开关
let VPanel = false;   // 面板开关
// 面板的设置
let VName = '';       // 物品名称
let VNMode = 'mc';    // 匹配模式
let VPrice = 0;       // 卖出价格
let VPMode = 'sq';    // 价格模式
let VSMode = 'hl';    // 皮肤磨损
let VAPMode = 'sddj'; // 定价方式
let VTask = false;    // 自动化开关
let VHash = '';       // APPID
let VRun = false;     // 终止任务
// 计时器
let Vart = -1;        //自动刷新
let Vfrt = -1;        //失败刷新
// 选项
const NameMode = { 'mc': '名称', 'lx': '类型', 'jj': '简介', 'qb': '全部' };
const PriceMode = { 'sq': '税前', 'sh': '税后' };
const SkinMode = {
    'ry': '不过滤', 'zx': '崭新出厂', 'lm': '略有磨损', 'jj': '久经沙场', 'ps': '破损不堪',
    'zh': '战痕累累', 'ym': '枪皮(有磨损)', 'wm': '非枪皮(无磨损)'
};
const AutoPriceMode = {
    'sddj': '手动定价', 
    'zgqg': '自动定价 - 当前最高求购价',
    'zdcs': '自动定价 - 当前最低出售价', 
    'lspj': '自动定价 - 历史平均成交价',
};

(function () {
    'use strict';
    loadCFG();
    addPanel();
    checkifCSGO()
    checkSetting();
    if (VTask) {
        console.log('已开启自动任务,1秒后开始执行');
        window.location.hash = VHash;
        setTimeout(() => {
            runAutomatic();
        }, 1000);
    }
})();

// 添加GUI
function addPanel() {
    function genMidButton(text, foo, id) {
        let a = document.createElement('a');
        let s = document.createElement('span');
        s.textContent = text;
        a.appendChild(s);
        a.addEventListener('click', foo);
        if (id) { a.id = id; }
        a.style.cssText = 'margin-right:15px;';
        a.className = 'btn_grey_black btn_medium'; //'btn_darkblue_white_innerfade btn_medium';
        return a;
    }
    function genSecond(ida, idi, value, tips, foo) {
        let a = document.createElement('a');
        let s = document.createElement('span');
        let s1 = document.createElement('span');
        let s2 = document.createElement('span');
        let i = genInput(idi, value, tips, true);
        a.id = ida;
        a.style.cssText = 'margin-right:15px;display:none';
        a.className = 'btn_grey_black btn_medium';
        s1.textContent = '每';
        s2.textContent = '秒';
        i.style.width = '40px';
        i.style.cssText += 'color:#000;background:#fff;vertical-align:inherit;';
        i.step = 1;
        i.min = 5;
        i.addEventListener('change', foo);
        a.appendChild(s);
        s.appendChild(s1);
        s.appendChild(i);
        s.appendChild(s2);
        return a;
    }
    function genButton(text, foo, id) {
        let b = document.createElement('button');
        b.textContent = text;
        b.style.verticalAlign = 'inherit';
        b.addEventListener('click', foo);
        if (id) { b.id = id; }
        return b;
    }
    function genDiv(cls, id) {
        let d = document.createElement('div');
        d.style.cssText = 'vertical-align:middle;';
        if (cls) { d.className = cls };
        if (id) { d.id = id };
        return d;
    }
    function genPanel(name) {
        let d = genDiv(name, name);
        d.style.cssText = 'background: rgba(58, 58, 58, 0.9);position: fixed;top: 50%;right: 0px;';
        d.style.cssText += 'text-align: center;transform: translate(0px, -50%);z-index: 100;';
        d.style.cssText += 'border: 1px solid rgb(83, 83, 83);padding: 5px;border-radius: 10px 0 0 10px;';
        d.style.cssText += 'transition:right 0.8s;right:-300px;width:280px;'
        // d.style.display = visiable ? 'block' : 'none';
        return d;
    }
    function genLabel(text, bind) {
        let l = document.createElement('label');
        l.textContent = text;
        l.style.verticalAlign = 'inherit';
        if (bind) { l.setAttribute('for', bind); }
        return l;
    }
    function genA(text, url) {
        let a = document.createElement('a');
        a.textContent = text;
        a.href = url;
        return a;
    }
    function genInput(id, value, tips, number) {
        let i = document.createElement('input');
        i.id = id;
        i.style.cssText = 'border:none;border-radius:0;margin:0px 5px;width:60%;text-align:center;';
        i.style.cssText += 'color:#000;background:#fff;vertical-align:inherit;';
        if (value) { i.value = value; }
        if (tips) { i.placeholder = tips; }
        if (number) {
            i.type = 'number';
            i.step = 0.01;
            i.min = 0;
        }
        return i;
    }
    function genSelect(id, choose, choice) {
        let s = document.createElement('select');
        s.id = id;
        s.style.cssText = 'color:#000;background:#fff;border:none;border-radius:0;vertical-align:inherit;';
        for (k in choose) {
            s.options.add(new Option(choose[k], k));
        }
        s.value = choice;
        return s;
    }
    function genSpace() {
        let s = document.createElement('span');
        s.textContent = '    ';
        return s;
    }
    function genBr() {
        return document.createElement('br');
    }
    function genHr() {
        return document.createElement('hr');
    }
    document.getElementById('pagebtn_previous').addEventListener('click', cancelHighLight);
    document.getElementById('pagebtn_next').addEventListener('click', cancelHighLight);
    document.querySelectorAll('.games_list_tabs>a').forEach((obj) => {
        obj.addEventListener('click', cancelHighLight);
    })

    let lBtnArea = document.querySelector('.inventory_links');
    let btnAutoReload = genMidButton(bool2txt(VAutoR) + '定时刷新', autoReloadCtrl, 'btnAutoReload');
    let btnFailReload = genMidButton(bool2txt(VFailR) + '出错刷新', failReloadCtrl, 'btnFailReload');
    let btnReloadConf = genSecond('btnReloadConf', 'iptTiming', VTime, '30', reloadTimeCtrl);
    lBtnArea.insertBefore(btnReloadConf, lBtnArea.children[0]);
    lBtnArea.insertBefore(btnAutoReload, lBtnArea.children[0]);
    lBtnArea.insertBefore(btnFailReload, lBtnArea.children[0]);

    let rBtnArea = document.querySelector('.inventory_rightnav');
    let btnSwitch = genMidButton('面板', switchPanel, 'btnSwitch');
    rBtnArea.insertBefore(btnSwitch, rBtnArea.children[0])

    let panelFunc = genPanel('autoSell');
    document.body.appendChild(panelFunc);
    let lblTitle = genLabel(`CIH - V ${Vver} - By `, null);
    let lblUrl = genA('Chr_', 'https://steamcommunity.com/id/Chr_');
    let lblFeed = genA('[反馈]', 'https://blog.chrxw.com/scripts.html');

    panelFunc.appendChild(lblTitle);
    panelFunc.appendChild(lblUrl);
    panelFunc.appendChild(genSpace());
    panelFunc.appendChild(lblFeed);
    panelFunc.appendChild(genHr());

    let divName = genDiv();
    divName.style.marginBottom = '5px'
    let lblName = genLabel('名称：', 'lblName');
    let iptName = genInput('iptName', VName, ' *? 可作通配符', false);
    let selName = genSelect('selName', NameMode, VNMode);

    divName.appendChild(lblName);
    divName.appendChild(iptName);
    divName.appendChild(selName);

    let divManualPrice = genDiv('divManualPrice', 'divManualPrice');
    divManualPrice.style.marginBottom = '5px'
    let lblPrice = genLabel('定价：', 'lblPrice');
    let iptPrice = genInput('iptPrice', VPrice > 0 ? VPrice : ''.toString(), '卖出价格', true);
    let selPrice = genSelect('selPrice', PriceMode, VPMode);

    divManualPrice.appendChild(lblPrice);
    divManualPrice.appendChild(iptPrice);
    divManualPrice.appendChild(selPrice);

    let divAutoPrice = genDiv();
    divAutoPrice.style.marginBottom = '5px'
    let lblAdvPrice = genLabel('定价方式：', 'lblAdvPrice');
    let selAdvPrice = genSelect('selAdvPrice', AutoPriceMode, VAPMode);

    divAutoPrice.appendChild(lblAdvPrice);
    divAutoPrice.appendChild(selAdvPrice);


    let divSkin = genDiv('divSkin', 'divSkin');
    let lblSkin = genLabel('磨损：', 'lblSkin');
    let selSkin = genSelect('selSkin', SkinMode, VSMode);
    divSkin.style.marginBottom = '5px'
    divSkin.appendChild(lblSkin);
    divSkin.appendChild(selSkin);

    let divAction = genDiv();
    divAction.style.marginBottom = '5px';
    let divAction2 = genDiv();

    let btnReload = genButton('重载库存', reloadInventory, 'btnTarget');
    let btnTarget = genButton('高亮匹配', enableHighLight, 'btnTarget');
    let btnFill = genButton('当前物品', autoFill, 'btnFill');
    let btnSetup = genButton('保 存', setupGoal, 'btnSetup');
    let btnReset = genButton('重 置', resetGoal, 'btnReset');

    divAction.appendChild(btnReload);
    divAction.appendChild(genSpace());
    divAction.appendChild(btnTarget);
    divAction.appendChild(genSpace());
    divAction.appendChild(btnFill);
    divAction2.appendChild(btnSetup);
    divAction2.appendChild(genSpace());
    divAction2.appendChild(btnReset);

    let divCtrl = genDiv();
    let btnManual = genButton('出售当前页', runManual, 'btnManual');
    let btnAutomatic = genButton(bool2txt(VTask) + '自动运行', runAutomaticCtrl, 'btnAutomatic');

    divCtrl.appendChild(btnManual);
    divCtrl.appendChild(genSpace());
    divCtrl.appendChild(btnAutomatic);
    divCtrl.appendChild(genSpace());

    panelFunc.appendChild(divName);
    panelFunc.appendChild(divManualPrice);
    panelFunc.appendChild(divAutoPrice);
    panelFunc.appendChild(divSkin);
    panelFunc.appendChild(genHr());
    panelFunc.appendChild(divAction);
    panelFunc.appendChild(divAction2);
    panelFunc.appendChild(genHr());
    panelFunc.appendChild(divCtrl);

    if (VFailR) { failReloadCtrl(); }
    if (VAutoR) { autoReloadCtrl(); }
    if (rBtnArea.children.length == 1) {
        btnSwitch.style.display = 'none';
    } else {
        if (VPanel) { switchPanel(); }
    }
}
// 出售当前页(单页)
function runManual() {
    let target = g_ActiveInventory.m_rgChildInventories == null ?
        g_ActiveInventory.m_rgItemElements :
        g_ActiveInventory.m_rgChildInventories[6].m_rgItemElements;
    let start = g_ActiveInventory.m_iCurrentPage * 25;
    let end = start + 25;
    let hashlist = [];//记录hash
    for (let i = start; i < end; i++) {
        if (target[i] == null) { continue; }//跳过无效元素
        let obj = target[i][0].rgItem;
        let desc = obj.description;
        if (desc.marketable == 0) { continue; }//跳过不可出售

        if (g_ActiveInventory.appid == 730) {//跳过磨损不匹配的项目
            if (VSMode != 'ry') {
                let ns = desc.descriptions;
                if (ns != undefined) {
                    let ms = checkSkin(ns[0].value);

                    if (
                        (VSMode == 'ym' && ms == '') ||
                        (VSMode == 'wm' && ms != '') ||
                        (VSMode != 'ym' && VSMode != 'wm' && ms != VSMode)
                    ) {
                        // console.log(ms);
                        continue;
                    }
                }
            }
        }

        if (VNMode == 'mc' || VNMode == 'qb') {
            let n = desc.name;
            if (isMatch(n.toLowerCase(), VName)) {
                hashlist.push(getHash(obj));
                continue;
            }
        }
        if (VNMode == 'lx' || VNMode == 'qb') {
            let n = desc.type;
            if (isMatch(n.toLowerCase(), VName)) {
                hashlist.push(getHash(obj));
                continue;
            }
        }
        if (VNMode == 'jj' || VNMode == 'qb') {
            let ns = desc.descriptions;
            if (ns != undefined) {
                for (let n of ns) {
                    if (isMatch(n.value.toLowerCase(), VName)) {
                        hashlist.push(getHash(obj));
                        break;
                    }
                }
            }
        }
    }
    VRun = true;
    if (hashlist.length == 0) {
        ShowAlertDialog('提示', '待出售物品列表为空');
    } else {
        autoSellFunc(hashlist);
    }
}
// 自动运行(前三页)
function runAutomatic() {
    let target = g_ActiveInventory.m_rgChildInventories == null ?
        g_ActiveInventory.m_rgItemElements :
        g_ActiveInventory.m_rgChildInventories[6].m_rgItemElements;
    let start = 0;
    let end = target.length;
    let hashlist = [];//记录hash
    for (let i = start; i < end; i++) {
        if (target[i] == null) { continue; }//跳过无效元素
        let obj = target[i][0].rgItem;
        let desc = obj.description;
        if (desc.marketable == 0) { continue; }//跳过不可出售

        if (g_ActiveInventory.appid == 730) {//跳过磨损不匹配的项目
            if (VSMode != 'ry') {
                let ns = desc.descriptions;
                if (ns != undefined) {
                    let ms = checkSkin(ns[0].value);

                    if (
                        (VSMode == 'ym' && ms == '') ||
                        (VSMode == 'wm' && ms != '') ||
                        (VSMode != 'ym' && VSMode != 'wm' && ms != VSMode)
                    ) {
                        // console.log(ms);
                        continue;
                    }
                }
            }
        }

        if (VNMode == 'mc' || VNMode == 'qb') {
            let n = desc.name;
            if (isMatch(n.toLowerCase(), VName)) {
                hashlist.push(getHash(obj));
                continue;
            }
        }
        if (VNMode == 'lx' || VNMode == 'qb') {
            let n = desc.type;
            if (isMatch(n.toLowerCase(), VName)) {
                hashlist.push(getHash(obj));
                continue;
            }
        }
        if (VNMode == 'jj' || VNMode == 'qb') {
            let ns = desc.descriptions;
            if (ns != undefined) {
                for (let n of ns) {
                    if (isMatch(n.value.toLowerCase(), VName)) {
                        hashlist.push(getHash(obj));
                        break;
                    }
                }
            }
        }
    }
    VRun = true;
    autoSellFunc(hashlist);
}
// 自动出售
function autoSellFunc(hashlist) {
    // console.log(hashlist);
    if (hashlist.length == 0) {
        console.log('待出售物品列表为空');
        // setTimeout(() => { window.location.reload(); }, 5000);
        VRun = false;
        return;
    }
    let i = 0;//当前操作的位置
    const max = 50; // 最大尝试次数
    let tries = 0; // 当前次数
    retry(waitLoad, 50);
    // 等待库存加载完全
    function waitLoad() {
        if (g_ActiveInventory.m_ActivePromise == null) {
            console.log('加载完毕');
            tries = 0;
            selectItem();
        } else {
            retry(waitLoad, 500);
        }
    }
    // 选择对象
    function selectItem() {
        let hash = hashlist[i++];
        if (hash != undefined) {
            window.location.hash = hash;
            retry(() => { // 稍微等一下
                SellCurrentSelection();
                tries = 0;
                retry(fillPrice, 50);
            }, 500);
        } else {
            console.log('列表执行完毕');
            VRun = false;
        }
    }
    // 填写价格
    function fillPrice() {
        let dialog = document.getElementById('market_sell_dialog');
        if (dialog != null && dialog.style.display != 'none') {
            let eula = document.getElementById('market_sell_dialog_accept_ssa');
            let sell = document.getElementById('market_sell_dialog_accept');
            if (eula != null && sell != null) {
                eula.checked = true;
                let price = null;
                if (VPMode == 'sq') {
                    price = document.getElementById('market_sell_buyercurrency_input');
                } else if (VPMode == 'sh') {
                    price = document.getElementById('market_sell_currency_input');
                } else {
                    throw 'VPMode有误';
                }
                price.value = VPrice;
                retry(() => { //等待响应完成
                    keyupSimulater(price);
                    retry(() => {
                        sell.click();
                        tries = 0;
                        retry(sellItem, 500);
                    });
                }, 200);
            } else {
                retry(fillPrice, 200);
            }
        } else {
            retry(fillPrice, 500);
        }
    }
    // 出售
    function sellItem() {
        let sell = document.getElementById('market_sell_dialog_ok');
        sell.click();
        retry(checkSuccess, 500)
    }
    // 判断上架是否成功
    function checkSuccess() {
        let dialog = document.getElementById('market_sell_dialog');
        let errmsg = document.getElementById('market_sell_dialog_error').textContent.trim();
        let succmsg = document.querySelector('.newmodal_header>div.title_text');
        let headertips = document.getElementById('market_headertip_itemsold');

        if (succmsg != null) { //上架成功，但是需要确认
            console.log('上架成功', succmsg.textContent);
            tries = 0;
            retry(closeModal, 200);
        } else if (dialog.style.display != 'none' && headertips.style.display != 'none') { //上架成功,但是无需确认
            if (succmsg != null) {
                console.log('上架成功', succmsg.textContent);
            } else {
                console.log('上架成功', headertips.textContent);
            }
            headertips.style.display = 'none';
            tries = 0;
            retry(closeModal, 200);
        } else if (dialog.style.display != 'none') {//上架失败,检查错误提示
            if (errmsg == '') {//等待响应
                retry(checkSuccess, 1000);
            } else if (errmsg.search('您已上架该物品并正等待确认') != -1 ||
                errmsg.search('You already have a listing for this item pending confirmation') != -1) {
                console.log('上架失败,当前物品正等待确认');
                tries = 0;
                retry(closeModal, 200);
            } else if (errmsg.search('您的物品在上架时出现问题') != -1 ||
                errmsg.search('There was a problem listing your item') != -1) {
                console.log('上架失败,重新尝试上架');
                retry(sellItem, 500);
            } else if (errmsg.search('直到前一个操作完成之前') != -1 ||
                errmsg.search('You cannot sell any items until your previous action completes') != -1) {
                console.log('上架失败,延长等待时间');
                retry(closeModal, 2000);
            } else {
                console.log('未知返回值', errmsg);
                tries = 0;
                retry(closeModal, 200);
            }
        } else {
            retry(checkSuccess, 1000);//其他情况
        }
    }
    // 关闭面板
    function closeModal() {
        let cs = document.querySelectorAll('.newmodal_close');
        if (cs != null) {
            cs.forEach((e) => { e.click(); })
        }
        tries = 0;
        retry(selectItem, 200);
    }
    // 自动重试
    function retry(foo, t) {
        console.log(foo.name);
        if (VRun) {
            if (tries++ <= max) {
                setTimeout(() => {
                    try {
                        foo();
                    } catch (e) {
                        console.error(e);
                    }
                }, t);
            } else {
                console.error('操作超时,等待页面刷新');
                VRun = false;
            }
        } else {
            console.error('手动终止自动任务');
        }
    }
    // 手动触发KeyUp
    function keyupSimulater(obj) {
        let e = new Event('keyup');
        obj.dispatchEvent(e);
    }
}
// 重载库存
function reloadInventory() {
    VRun = false;
    let appid = g_ActiveInventory.appid;
    let contextid = g_ActiveInventory.contextid;
    g_ActiveInventory.m_owner.ReloadInventory(appid, contextid);
}
// 获取Hash字符串
function getHash(obj) {
    return '#' + obj.appid.toString() + '_' + obj.contextid + '_' + obj.assetid;
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
// 判断是否为CSGO,否则隐藏磨损筛选
function checkifCSGO() {
    let div = document.getElementById('divSkin');
    if (g_ActiveInventory.appid == 730) {
        div.style.display = '';
    } else {
        div.style.display = 'none';
    }
}
// 取消高亮
function cancelHighLight() {
    let div = document.getElementById('divSkin');
    if (g_ActiveInventory.appid == 730) {
        div.style.display = '';
    } else {
        div.style.display = 'none';
    }
    let target = g_ActiveInventory.m_rgChildInventories == null ?
        g_ActiveInventory.m_rgItemElements :
        g_ActiveInventory.m_rgChildInventories[6].m_rgItemElements;
    let start = g_ActiveInventory.m_iCurrentPage * 25;
    let end = start + 25;
    for (let i = start; i < end; i++) {
        if (target[i] != null) {
            let objstyle = target[i][0].children[0].style;
            objstyle.outlineStyle = 'none';
        }
    }
    checkifCSGO();
}
// 检查是否有子TAB
function checkSubChoose() {
    if (g_ActiveInventory.contextid == '0') {
        let choose = document.getElementById('contextselect_activecontext');
        ShowAlertDialog('错误', '请先选择子分类');
        choose.style.outline = '3px #f00 dashed';
        setTimeout(() => { choose.style.outline = ''; }, 5000);
        return true;
    } else {
        return false;
    }
}
// 判断磨损
function checkSkin(str) {
    switch (str) {
        case '外观： 崭新出厂':
        case 'Exterior: Factory New':
            return 'zx';
        case '外观： 略有磨损':
        case 'Exterior: Minimal Wear':
            return 'lm';
        case '外观： 久经沙场':
        case 'Exterior: Field-Tested':
            return 'jj';
        case '外观： 破损不堪':
        case 'Exterior: Well-Worn':
            return 'ps';
        case '外观： 战痕累累':
        case 'Exterior: Battle-Scarred':
            return 'zh';
        default:
            return '';
    }
}
// 高亮匹配项
function enableHighLight() {
    if (checkSubChoose()) { return; }// 必须选择子TAB
    let target = g_ActiveInventory.m_rgItemElements;
    let pattern = document.getElementById('iptName').value.toLowerCase();
    // if (pattern == '') { pattern = '*'; }
    let mode = document.getElementById('selName').value;
    let skin = document.getElementById('selSkin').value;
    let start = g_ActiveInventory.m_iCurrentPage * 25;
    let end = start + 25;
    let matchlist = [];
    for (let i = start; i < end; i++) {
        if (target[i] != null) {
            let desc = target[i][0].rgItem.description;

            if (g_ActiveInventory.appid == 730) {//跳过磨损不匹配的项目
                if (skin != 'ry') {
                    let ns = desc.descriptions;
                    if (ns != undefined) {
                        let ms = checkSkin(ns[0].value);

                        if (
                            (skin == 'ym' && ms == '') ||
                            (skin == 'wm' && ms != '') ||
                            (skin != 'ym' && skin != 'wm' && ms != skin)
                        ) {
                            // console.log(ms);
                            continue;
                        }
                    }
                }
            }

            if (mode == 'mc' || mode == 'qb') {
                let n = desc.name;
                if (isMatch(n.toLowerCase(), pattern)) {
                    matchlist.push(i);
                    continue;
                }
            }
            if (mode == 'lx' || mode == 'qb') {
                let n = desc.type;
                if (isMatch(n.toLowerCase(), pattern)) {
                    matchlist.push(i);
                    continue;
                }
            }
            if (mode == 'jj' || mode == 'qb') {
                let ns = desc.descriptions;
                if (ns != undefined) {
                    for (let n of ns) {
                        if (isMatch(n.value.toLowerCase(), pattern)) {
                            matchlist.push(i);
                            break;
                        }
                    }
                }
            }
        }
    }
    for (let i = start; i < end; i++) { //高亮显示
        if (target[i] != null) {
            let obj = target[i][0];
            let objstyle = obj.children[0].style;
            if (matchlist.indexOf(i) != -1) {
                objstyle.outlineStyle = 'dashed';
                objstyle.outlineOffset = '-2px';
                if (obj.rgItem.description.marketable == 1) {
                    objstyle.outlineColor = '#FF9900'; //可交易
                } else {
                    objstyle.outlineColor = '#CCCCFF'; //不可交易
                }
            } else {
                objstyle.outlineStyle = 'none';
            }
        }
    }
}
// 按照当前物品填充设置
function autoFill() {
    let current = g_ActiveInventory.selectedItem;
    if (current) {
        let desc = current.description;
        let mode = document.getElementById('selName').value;
        let skin = document.getElementById('selSkin');
        let iptname = document.getElementById('iptName');
        let iptPrice = document.getElementById('iptPrice');
        iptname.value = '';

        if (g_ActiveInventory.appid == 730) { // 填充磨损设定
            if (skin != 'ry') {
                let ns = desc.descriptions;
                if (ns != undefined) {
                    let ms = checkSkin(ns[0].value);

                    if (ms != '') {
                        skin.value = ms;
                    } else {
                        skin.value = 'wm';
                    }
                }
            }
        }

        if (mode == 'mc' || mode == 'qb') {
            iptname.value = desc.name;
        }
        else if (mode == 'lx') {
            iptname.value = desc.type;
        }
        else if (mode == 'jj') {
            let ns = desc.descriptions;
            if (ns != undefined) {
                for (let n of ns) {
                    if (n.value != '') {
                        iptname.value = n.value;
                        break;
                    } else {
                        iptname.value = '【该物品无简介】'
                    }
                }
            }
        }

        iptPrice.focus();
    } else {
        ShowAlertDialog('错误', '未选中物品');
    }
    console.log(current);
}
// 设置目标
function setupGoal() {
    if (checkSubChoose()) { return; } // 必须选择子TAB
    let name = document.getElementById('iptName').value.toLowerCase();
    let nmode = document.getElementById('selName').value;
    let price = Number(document.getElementById('iptPrice').value);
    let pmode = document.getElementById('selPrice').value;
    let apmode = document.getElementById('selAdvPrice').value;
    let smode = document.getElementById('selSkin').value;
    VRun = false;
    if (NameMode[nmode] != undefined &&
        PriceMode[pmode] != undefined &&
        AutoPriceMode[apmode] != undefined &&
        SkinMode[smode] != undefined &&
        price == price && price > 0) {
        VName = name;
        VNMode = nmode;
        VPrice = Math.floor(price * 100) / 100;
        VAPMode = apmode;
        VPMode = pmode;
        VSMode = smode;
        VHash = '#' + g_ActiveInventory.appid.toString() + '_' + g_ActiveInventory.contextid.toString();
        saveCFG();
        ShowAlertDialog('成功', '设置保存成功，请选择运行模式。<br>【出售当前页】：按照设置自动出售当前页的物品（只执行一次）。<br>【自动运行】：按照设置自动出售前三页的物品（每次刷新后执行）。<br>【自动运行】需要配合【定时刷新】和【出错刷新】使用。');
    } else {
        ShowAlertDialog('错误', '价格填写有误。<br>价格必须是大于0的数字（支持整数和小数）。');
    }
    checkSetting();
}
// 重置目标
function resetGoal() {
    let name = document.getElementById('iptName');
    name.value = '';
    name.focus();
    document.getElementById('selName').value = 'mc';
    document.getElementById('iptPrice').value = '';
    document.getElementById('selPrice').value = 'sq';
    document.getElementById('selAdvPrice').value = 'sddj';
    document.getElementById('selSkin').value = 'ry';
    VName = '';
    VNMode = 'mc';
    VPrice = 0;
    VPMode = 'sq';
    VAPMode='sddj';
    VSMode = 'hl';
    VHash = '';
    VRun = false;
    if (VTask) { runAutomaticCtrl(); }
    saveCFG();
    checkSetting();
}
// 检测设置是否正确
function checkSetting() {
    let btnManual = document.getElementById('btnManual');
    let btnAutomatic = document.getElementById('btnAutomatic');
    if (VPrice == VPrice && VPrice > 0) {
        btnAutomatic.disabled = false;
        btnManual.disabled = false;
    } else {
        btnAutomatic.disabled = true;
        btnManual.disabled = true;
    }
}
// 自动任务控制
function runAutomaticCtrl() {
    VTask = !VTask;
    document.getElementById('btnAutomatic').textContent = bool2txt(VTask) + '自动运行';
    saveCFG();
    if (VTask) {
        ShowAlertDialog('说明', '成功开启自动任务。<br>每次刷新页面后将会按照设置自动出售前三页的物品。<br>本功能需要配合【定时刷新】和【出错刷新】使用。');
    }
}
// 定时刷新控制
function autoReloadCtrl() {
    let btn = document.getElementById('btnReloadConf');
    VTime = readTime(30);
    if (Vart == -1) {
        btn.style.display = '';
        Vart = setInterval(() => {
            window.location.reload();
        }, VTime * 1000);
        console.log(`刷新时间${VTime}秒`);
    } else {
        clearInterval(Vart);
        Vart = -1;
    }
    VAutoR = Vart != -1;
    document.getElementById('btnAutoReload').children[0].textContent = bool2txt(VAutoR) + '定时刷新';
    saveCFG();
}
// 设置刷新时间
function reloadTimeCtrl() {
    VTime = readTime(30);
    if (VAutoR) {
        clearInterval(Vart);
        Vart = setInterval(() => {
            window.location.reload();
        }, VTime * 1000);
        console.log(`刷新时间${VTime}秒`);
    }
    saveCFG();
}
// 出错刷新控制
function failReloadCtrl() {
    if (Vfrt == -1) {
        Vfrt = setInterval(() => {
            // console.log('checkfail');
            let err = document.querySelector('.inventory_load_error_header');
            if (err) { window.location.reload(); }
        }, 3000);
    } else {
        clearInterval(Vfrt);
        Vfrt = -1;
    }
    VFailR = Vfrt != -1;
    document.getElementById('btnFailReload').children[0].textContent = bool2txt(VFailR) + '出错刷新';
    saveCFG();
}
// 显示/隐藏面板
function switchPanel() {
    let p = document.getElementById('autoSell');
    let b = document.getElementById('btnSwitch');
    if (p.style.right == '-300px') {
        p.style.right = '0';
        b.className = 'btn_darkblue_white_innerfade btn_medium';
    } else {
        p.style.right = '-300px';
        b.className = 'btn_grey_black btn_medium';
    }
    VPanel = p.style.right != '-300px';
    saveCFG();
}
// 显示布尔
function bool2txt(bool) {
    return bool ? '√ ' : '× ';
}
// 文本转数字
function readTime(def) {
    let ipt = document.getElementById('iptTiming');
    let i = Number(ipt.value);
    if (i != i || i < 5) {
        return def;
    } else {
        return i;
    }
}
// 读取设置
function loadCFG() {
    let t = null;
    t = GM_getValue('VAutoR');
    VAutoR = Boolean(t);
    t = GM_getValue('VFailR');
    VFailR = Boolean(t);
    t = GM_getValue('VTime');
    VTime = t ? t : 30;
    t = GM_getValue('VPanel');
    VPanel = Boolean(t);
    t = GM_getValue('VName');
    VName = t ? t.toLowerCase() : '';
    t = GM_getValue('VNMode');
    if (NameMode[t] == undefined) { t = 'mc'; }
    VNMode = t;
    t = GM_getValue('VPrice');
    VPrice = t ? t : 0;
    t = GM_getValue('VPMode');
    if (PriceMode[t] == undefined) { t = 'sq'; }
    VPMode = t;
    t = GM_getValue('VAPMode');
    if (AutoPriceMode[t] == undefined) { t = 'zdcs'; }
    VAPMode = t;
    t = GM_getValue('VSMode');
    if (SkinMode[t] == undefined) { t = 'ry'; }
    VSMode = t;
    t = GM_getValue('VTask');
    VTask = Boolean(t);
    t = GM_getValue('VHash');
    VHash = t ? t : '';
    if (VTask) { VPanel = true; }//开启自动任务后始终打开面板
    saveCFG();
}
// 保存设置
function saveCFG() {
    GM_setValue('VAutoR', VAutoR);
    GM_setValue('VTime', VTime);
    GM_setValue('VFailR', VFailR);
    GM_setValue('VPanel', VPanel);
    GM_setValue('VName', VName);
    GM_setValue('VNMode', VNMode);
    GM_setValue('VPrice', VPrice);
    GM_setValue('VPMode', VPMode);
    GM_setValue('VAPMode', VAPMode);
    GM_setValue('VSMode', VSMode);
    GM_setValue('VTask', VTask);
    GM_setValue('VHash', VHash);
}

// 获取选中物品的name_id
function getItemNameid(){
    let hash = 1;

    //TODO 鸽了，看爱死机2去了。
}


// 获取当前选中的物品定价
function getItemPrice() {
    let country = 0
    let url = `https://steamcommunity.com/market/listings/${appid}/${market_hash}`;


}



