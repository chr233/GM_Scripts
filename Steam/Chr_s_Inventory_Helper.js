// ==UserScript==
// @name         Chr_'s_Inventory_Helper
// @name:zh-CN   Steam库存批量出售By Chr_
// @namespace    https://blog.chrxw.com
// @version      3.0
// @description  Steam库存批量出售
// @author       Chr_
// @include      /https://steamcommunity\.com/(id|profiles)/[^\/]+/inventory/?/
// @connect      steamcommunity.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @require      https://greasyfork.org/scripts/429004-dragmove-js/code/dragmovejs.js
// ==/UserScript==

(() => {
    const Version = '3.0';// 版本号
    // 上面的开关
    let GBtns = {};     // 按钮开关

    let GObjs = {};     //控件数组

    (() => {

        graphGUI();

    })();

    // 添加GUI
    function graphGUI() {
        function genButton(text, foo, enable = true) {
            const b = document.createElement('button');
            b.textContent = text;
            b.className = 'cih_button';
            b.disabled = !enable;
            b.addEventListener('click', foo);
            return b;
        }
        function genDiv(cls = 'cih_div') {
            const d = document.createElement('div');
            d.className = cls;
            return d;
        }
        function genA(text, url) {
            const a = document.createElement('a');
            a.textContent = text;
            a.className = 'cih_a';
            a.target = '_blank';
            a.href = url;
            return a;
        }
        function genInput(value, tips, number = false) {
            const i = document.createElement('input');
            i.className = 'cih_input';
            if (value) { i.value = value; }
            if (tips) { i.placeholder = tips; }
            if (number) {
                i.type = 'number';
                i.step = 100;
                i.min = 0;
            }
            return i;
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
        function genTextArea(value, tips) {
            const i = document.createElement('textarea');
            i.className = 'cih_textarea';
            if (value) { i.value = value; }
            if (tips) { i.placeholder = tips; }
            return i;
        }
        function genCheckbox(name, checked = false) {
            const l = document.createElement('label');
            const i = document.createElement('input');
            const s = genSpace(name);
            i.textContent = name;
            i.type = 'checkbox';
            i.className = 'cih_checkbox';
            i.checked = checked;
            l.appendChild(i);
            l.appendChild(s);
            return [l, i];
        }
        function genSelect(choose = [], choice = null) {
            const s = document.createElement('select');
            s.className = 'cih_select';
            choose.forEach(([text, value]) => {
                s.options.add(new Option(text, value));
            });
            if (choice) { s.value = choice; }
            return s;
        }
        function genList(choose = [], choice = null) {
            const s = genSelect(choose, choice);
            s.className = 'cih_list';
            s.setAttribute('multiple', 'multiple');
            return s;
        }
        function genP(text) {
            const p = document.createElement('p');
            p.textContent = text;
            return p;
        }
        function genSpan(text = '    ') {
            const s = document.createElement('span');
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
            const a = document.createElement('a');
            const s = genSpan(text);
            a.className = 'btn_grey_black btn_medium cih_mid_btn';
            a.addEventListener('click', foo);
            a.appendChild(s);
            return [a, s];
        }

        //添加事件
        // document.getElementById('pagebtn_previous').addEventListener('click', cancelHighLight);
        // document.getElementById('pagebtn_next').addEventListener('click', cancelHighLight);
        // document.querySelectorAll('.games_list_tabs>a').forEach((ele) => {
        //     ele.addEventListener('click', cancelHighLight);
        // })

        const { fail, auto, second } = GBtns;


        //按钮栏
        let TopBtnArea = document.querySelector('.inventory_links');
        let [bAutoReload, btnAutoReload] = genMidBtn(bool2txt(auto) + '定时刷新', null);
        let [bFailReload, btnFailReload] = genMidBtn(bool2txt(fail) + '出错刷新', null);
        // let btnReloadConf = genSecond( second, '30', reloadTimeCtrl);
        // TopBtnArea.insertBefore(btnReloadConf, TopBtnArea.children[0]);
        TopBtnArea.insertBefore(bAutoReload, TopBtnArea.children[0]);
        TopBtnArea.insertBefore(bFailReload, TopBtnArea.children[0]);


        dragmove(bAutoReload, bAutoReload, onStart, onEnd);
        dragmove(bFailReload, bFailReload, onStart, onEnd);




        // let rBtnArea = document.querySelector('.inventory_rightnav');
        // let btnSwitch = genMidButton('面板', switchPanel, 'btnSwitch');
        // rBtnArea.insertBefore(btnSwitch, rBtnArea.children[0])

        // let panelFunc = genPanel('autoSell');
        // document.body.appendChild(panelFunc);
        // let lblTitle = genLabel(`CIH - V ${Version} - By `, null);
        // let lblUrl = genA('Chr_', 'https://steamcommunity.com/id/Chr_');
        // let lblFeed = genA('[反馈]', 'https://blog.chrxw.com/scripts.html');

        // panelFunc.appendChild(lblTitle);
        // panelFunc.appendChild(lblUrl);
        // panelFunc.appendChild(genSpace());
        // panelFunc.appendChild(lblFeed);
        // panelFunc.appendChild(genHr());

        // let divName = genDiv();
        // divName.style.marginBottom = '5px'
        // let lblName = genLabel('名称：', 'lblName');
        // let iptName = genInput('iptName', VName, ' *? 可作通配符', false);
        // let selName = genSelect('selName', NameMode, VNMode);

        // divName.appendChild(lblName);
        // divName.appendChild(iptName);
        // divName.appendChild(selName);

        // let divManualPrice = genDiv('divManualPrice', 'divManualPrice');
        // divManualPrice.style.marginBottom = '5px'
        // let lblPrice = genLabel('定价：', 'lblPrice');
        // let iptPrice = genInput('iptPrice', VPrice > 0 ? VPrice : ''.toString(), '卖出价格', true);
        // let selPrice = genSelect('selPrice', PriceMode, VPMode);

        // divManualPrice.appendChild(lblPrice);
        // divManualPrice.appendChild(iptPrice);
        // divManualPrice.appendChild(selPrice);

        // let divAutoPrice = genDiv();
        // divAutoPrice.style.marginBottom = '5px'
        // let lblAdvPrice = genLabel('定价方式：', 'lblAdvPrice');
        // let selAdvPrice = genSelect('selAdvPrice', AutoPriceMode, VAPMode);

        // divAutoPrice.appendChild(lblAdvPrice);
        // divAutoPrice.appendChild(selAdvPrice);


        // let divSkin = genDiv('divSkin', 'divSkin');
        // let lblSkin = genLabel('磨损：', 'lblSkin');
        // let selSkin = genSelect('selSkin', SkinMode, VSMode);
        // divSkin.style.marginBottom = '5px'
        // divSkin.appendChild(lblSkin);
        // divSkin.appendChild(selSkin);

        // let divAction = genDiv();
        // divAction.style.marginBottom = '5px';
        // let divAction2 = genDiv();

        // let btnReload = genButton('重载库存', reloadInventory, 'btnTarget');
        // let btnTarget = genButton('高亮匹配', enableHighLight, 'btnTarget');
        // let btnFill = genButton('当前物品', autoFill, 'btnFill');
        // let btnSetup = genButton('保 存', setupGoal, 'btnSetup');
        // let btnReset = genButton('重 置', resetGoal, 'btnReset');

        // divAction.appendChild(btnReload);
        // divAction.appendChild(genSpace());
        // divAction.appendChild(btnTarget);
        // divAction.appendChild(genSpace());
        // divAction.appendChild(btnFill);
        // divAction2.appendChild(btnSetup);
        // divAction2.appendChild(genSpace());
        // divAction2.appendChild(btnReset);

        // let divCtrl = genDiv();
        // let btnManual = genButton('出售当前页', runManual, 'btnManual');
        // let btnAutomatic = genButton(bool2txt(VTask) + '自动运行', runAutomaticCtrl, 'btnAutomatic');

        // divCtrl.appendChild(btnManual);
        // divCtrl.appendChild(genSpace());
        // divCtrl.appendChild(btnAutomatic);
        // divCtrl.appendChild(genSpace());

        // panelFunc.appendChild(divName);
        // panelFunc.appendChild(divManualPrice);
        // panelFunc.appendChild(divAutoPrice);
        // panelFunc.appendChild(divSkin);
        // panelFunc.appendChild(genHr());
        // panelFunc.appendChild(divAction);
        // panelFunc.appendChild(divAction2);
        // panelFunc.appendChild(genHr());
        // panelFunc.appendChild(divCtrl);

        // if (VFailR) { failReloadCtrl(); }
        // if (VAutoR) { autoReloadCtrl(); }
        // if (rBtnArea.children.length == 1) {
        //     btnSwitch.style.display = 'none';
        // } else {
        //     if (VPanel) { switchPanel(); }
        // }

        GObjs = { btnAutoReload, btnFailReload };



        const snapThreshold = 50;
        function onStart(el, x, y) {
            // On drag start, remove the fixed bottom style to prevent the bottom
            // from sticking on the screen.
            el.style.top = el.offsetTop + "px"
            el.style.bottom = "auto"
        }
        
        function onEnd(el, x, y) {
            console.log('end');
            // Automatically snap to corners.
            if (window.innerHeight - (el.offsetTop + el.offsetHeight) < snapThreshold) {
                el.style.top = "auto"
                el.style.bottom = "0px"
            }
            if (window.innerWidth - (el.offsetLeft + el.offsetWidth) < snapThreshold) {
                el.style.left = "auto"
                el.style.right = "0px"
            }
            if (el.offsetTop < snapThreshold) {
                el.style.top = "0px"
            }
            if (el.offsetLeft < snapThreshold) {
                el.style.left = "0px"
            }
        }

    }






    // 显示布尔
    function bool2txt(bool) {
        return bool ? '✅' : '❌';
    }

})();



class Request {
    constructor(timeout = 3000) {
        this.timeout = timeout;
    }
    get(url, opt = {}) {
        return this.baseRequest(url, 'GET', opt, 'json');
    }
    getHtml(url, opt = {}) {
        return this.baseRequest(url, 'GET', opt, '');
    }
    getText(url, opt = {}) {
        return this.baseRequest(url, 'GET', opt, 'text');
    }
    post(url, data, opt = {}) {
        opt.data = JSON.stringify(data);
        return this.baseRequest(url, 'POST', opt, 'json');
    }
    baseRequest(url, method = 'GET', opt = {}, responseType = 'json') {
        Object.assign(opt, {
            url, method, responseType, timeout: this.timeout
        });
        return new Promise((resolve, reject) => {
            opt.ontimeout = opt.onerror = reject;
            opt.onload = ({ readyState, status, response, responseText }) => {
                if (readyState === 4 && status === 200) {
                    if (responseType == 'json') {
                        resolve(response);
                    } else if (responseType == 'text') {
                        resolve(responseText);
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

GM_addStyle(`
.cih_mid_btn{
    margin-right: 15px;
}
`);