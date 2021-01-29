// ==UserScript==
// @name         Auto_Sub3
// @namespace    https://blog.chrxw.com
// @version      1.0
// @description  一键快乐-3
// @author       Chr_
// @include      https://keylol.com/*
// @connect      steamcommunity.com
// @connect      steampowered.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

// 上次-3时间
let VLast = 0;
// 今天还能不能-3
let VCan3 = true;
// 自动展开
let VShow = false;
// 自动-3
let VAuto = false;

(function () {
    'use strict';
    loadCFG();
    addBtns();
    if (VShow) {
        switchPanel();
    }
    if (VCan3 && VAuto) {
        autoRoll();
    }
})();
// 添加GUI
function addBtns() {
    function genButton(text, foo, id) {
        let b = document.createElement('button');
        b.textContent = text;
        b.style.cssText = 'margin: 3px 5px;'
        b.addEventListener('click', foo);
        if (id) { b.id = id; }
        return b;
    }
    function genDiv(cls) {
        let d = document.createElement('div');
        if (cls) { d.className = cls };
        return d;
    }
    function genPanel(name, visiable) {
        let p = genDiv(name);
        p.id = name;
        p.style.cssText = 'width: 100%;height: 100%;';
        if (!visiable) { p.style.display = 'none'; }
        return p;
    }
    let btnSwitch = document.querySelector('.index_left_title>div');

    if (btnSwitch == null) { return; }

    btnSwitch.id = 'btnSwitch1';
    btnSwitch.style.cssText = 'width: auto;padding: 0 5px;';
    btnSwitch.addEventListener('click', switchPanel);

    let panelArea = document.querySelector('.index_navi_left');
    let panelOri = document.querySelector('.index_left_detail');
    panelOri.id = 'panelOri'

    let panel54 = genPanel('panel54');

    let aLP = document.createElement('a');
    aLP.href = 'https://keylol.com/t571093-1-1';
    let img54 = document.createElement('img');
    img54.src = 'https://blog.chrxw.com/usr/keylol/index.png';
    img54.alt = '总之这里是54的名言';
    img54.style.cssText = 'float: right;margin-top: -28px;height: 100%;'
    aLP.appendChild(img54);

    let btnArea = genDiv('btnArea');
    btnArea.style.cssText = 'width: 210px;text-align: center;margin-top: -10px;';

    let btnS3 = genButton('【一键-3】', autoRoll, 'btnS3');

    if (!VCan3) {
        btnS3.style.textDecoration = 'line-through';
        btnS3.textContent = '今天已经不能-3了';
    }
    // let btnFT = genButton('我要水贴', () => { window.location.href = 'https://keylol.com/forum.php?mod=post&action=newthread&fid=148' });

    let btnShow = genButton(bool2txt(VShow) + '自动打开面板', fBtnShow, 'btnShow');
    let btnAuto = genButton(bool2txt(VAuto) + '自动每日-3', fBtnAuto, 'btnAuto');

    btnArea.appendChild(btnS3);
    // btnArea.appendChild(btnFT);
    btnArea.appendChild(btnShow);
    btnArea.appendChild(btnAuto);

    panel54.appendChild(aLP);
    panel54.appendChild(btnArea);
    panelArea.insertBefore(panel54, panelArea.children[1]);
}

// 显示小轮盘
function showLiteRoll() {
    // TODO 显示轮盘，手动-3
}
// 自动打开面板
function fBtnShow() {
    VShow = !VShow;
    document.getElementById('btnShow').textContent = bool2txt(VShow) + '自动打开面板';
    saveCFG();
}
// 自动-3
function fBtnAuto() {
    VAuto = !VAuto;
    document.getElementById('btnAuto').textContent = bool2txt(VAuto) + '自动每日-3';
    saveCFG();
}
// 显示布尔
function bool2txt(bool) {
    return bool ? '【√】' : '【×】';
}
// 隐藏面板
function switchPanel() {
    let panel1 = document.getElementById('panel54');
    let panel2 = document.getElementById('panelOri');
    if (panel1.style.display == 'none') {
        btnSwitch1.textContent = '今天你【-3】了吗 - By Chr_';
        panel1.style.display = 'block';
        panel2.style.display = 'none';
    } else {
        btnSwitch1.textContent = '关注重点';
        panel1.style.display = 'none';
        panel2.style.display = 'block';
    }
}

// 读取设置
function loadCFG() {
    let t = null;
    t = GM_getValue('VLast');
    VLast = t ? t : 0;
    t = GM_getValue('VCan3');
    VCan3 = Boolean(t);
    t = GM_getValue('VShow');
    VShow = Boolean(t);
    t = GM_getValue('VAuto');
    VAuto = Boolean(t);
    // 日期变更,重置VCan3
    let d = new Date().getDate();
    if (d != VLast) {
        VCan3 = true;
        VLast = d;
    }
    saveCFG();
}
// 保存设置
function saveCFG() {
    GM_setValue('VLast', VLast);
    GM_setValue('VCan3', VCan3);
    GM_setValue('VShow', VShow);
    GM_setValue('VAuto', VAuto);
}
// 检查能否-3
function checkZP() {
    GM_xmlhttpRequest({
        method: "GET",
        url: 'https://keylol.com/plugin.php?id=steamcn_lottery:view&lottery_id=43',
        onload: function (response) {
            if (response.responseText != null) {
                let t = response.responseText;
                let can = t.search('<button id="roll">抽奖</button>') != -1;
                console.log(can);
                VCan3 = can;
                if (!can) {
                    disableS3();
                }
                saveCFG();
            }
        }
    });
}
// 禁止-3
function disableS3() {
    let b = document.getElementById('btnS3');
    b.style.textDecoration = 'line-through';
    b.textContent = '今天已经不能-3了';
}
// 自动-3
function autoRoll() {
    try {
        var sound = new Audio();
        sound.src = "https://blog.chrxw.com/usr/keylol/gas.mp3";
        sound.play();
    } catch (e) {
        console.error(e);
    }
    if (!VCan3) {
        return;
    }
    let v = 0;
    roll();
    roll();
    roll();
    function roll() {
        GM_xmlhttpRequest({
            method: "GET",
            url: 'https://keylol.com/plugin.php?id=steamcn_lottery:view&lottery_id=43&hash=2a7522a6&roll',
            onload: function (response) {
                if (response.status == 200) {
                    console.log(response.responseText);
                } else {
                    console.log('出错')
                }
                if (++v == 3) {
                    VCan3 = false;
                    disableS3();
                    saveCFG();
                }
            }
        });
    }
}