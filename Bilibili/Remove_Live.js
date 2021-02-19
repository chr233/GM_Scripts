// ==UserScript==
// @name         Remove_Live
// @namespace    https://blog.chrxw.com
// @version      1.0
// @description  去除B站多余的直播播放器（滑稽）
// @author       Chr_
// @include      https://live.bilibili.com/*
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(() => {
    'use strict';
    //去除播放器的开关
    let VEnable = false;
    VEnable = GM_getValue('VE') == true;
    if (VEnable) {
        setTimeout(() => {
            document.getElementById('live-player').remove();
        }, 3000);
    }
    let btnArea = document.querySelector('.upper-right-ctnr');
    let btn = document.createElement('button');
    btn.id = 'removeLive';
    btn.textContent = bool2txt(VEnable) + '移除播放器';
    btn.addEventListener('click', removeLive);
    btnArea.insertBefore(btn, btnArea.children[0]);
    function removeLive() {
        VEnable = !VEnable;
        GM_setValue('VE', VEnable);
        btn.textContent = bool2txt(VEnable) + '移除播放器';
        if (VEnable) {
            document.getElementById('live-player').remove();
        } else {
            window.location.reload();
        }
    }
    // 显示布尔
    function bool2txt(bool) {
        return bool ? '【√】' : '【×】';
    }
})();

