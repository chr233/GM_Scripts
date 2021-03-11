// ==UserScript==
// @name         Steam_Spoiler_Scraper
// @namespace    https://blog.chrxw.com
// @version      1.1
// @description  Steam 隐藏内容刮刀
// @author       Chr_
// @include      /https://steamcommunity\.com/sharedfiles/filedetails/\?id=\d+?$/
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// ==/UserScript==

// 初始化
(() => {
    'use strict';
    addPanel();
    addFunction();
})();

// 添加按钮
function addPanel() {
    function genBtn(name, foo, tooltip, id) {
        let s = document.createElement('span');
        s.className = 'general_btn tooltip';
        s.title = tooltip;
        s.textContent = name;
        s.addEventListener('click', foo);
        if (id) { s.id = id; }
        return s;
    }
    let btnReport = document.getElementById('ReportItemBtn');
    if (btnReport != null) {
        let btnDiv = btnReport.parentElement;
        let btnShow = genBtn('刮开', scratchAll, '刮开所有隐藏', 'btnShow');
        let btnHide = genBtn('恢复', unScratchAll, '恢复所有隐藏', 'btnHide');
        btnDiv.appendChild(btnShow);
        btnDiv.appendChild(btnHide);
    }
}

// 为每个隐藏绑定函数
function addFunction() {
    document.querySelectorAll('.bb_spoiler').forEach((ele) => {
        ele.addEventListener('click', scratch);
    });
}

// 刮开单个隐藏
function scratch(ele) {
    let s = ele.currentTarget;
    console.log(s.getAttribute('scratch'))
    if (s.getAttribute('scratch') != 'on') {
        s.querySelectorAll('*').forEach((e) => {
            e.style.cssText = 'visibility:visible;color:#fff;';
        });
        s.setAttribute('scratch', 'on');
    } else {
        s.querySelectorAll('*').forEach((e) => {
            e.style.cssText = '';
        });
        s.setAttribute('scratch', 'off');
    }
}

// 刮开所有隐藏
function scratchAll() {
    document.querySelectorAll('.bb_spoiler').forEach((ele) => {
        if (ele.getAttribute('scratch') != 'on') {
            ele.click();
        }
    });
}

// 恢复所有隐藏
function unScratchAll() {
    document.querySelectorAll('.bb_spoiler').forEach((ele) => {
        if (ele.getAttribute('scratch') == 'on') {
            ele.click();
        }
    });
}