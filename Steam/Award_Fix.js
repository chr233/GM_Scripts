// ==UserScript==
// @name         Award_Fix
// @namespace    https://blog.chrxw.com
// @version      1.1
// @description  Steam打赏修复
// @author       Chr_
// @include      /https://steamcommunity\.com/(id|profiles)/[^\/]+/recommended\/?(\?p=\d+)?$/
// @connect      steamcommunity.com
// @connect      steampowered.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// ==/UserScript==

(function () {
    'use strict';
    let ts = document.querySelectorAll('.review_award_ctn');
    if (ts) {
        for (let t of ts) {
            t.style.flexWrap = 'wrap';
        }
    }
})();
