// ==UserScript==
// @name         Award_Fix
// @namespace    https://blog.chrxw.com
// @version      1.0
// @description  Steam自动打赏修复
// @author       Chr_
// @include      /https://steamcommunity\.com/(id|profiles)/[^\/]+/recommended\/?(\?p=\d+)?$/
// @connect      steamcommunity.com
// @connect      steampowered.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

        let ts = document.querySelectorAll('.review_award_ctn');
        if (ts) {
            for (let t of ts) {
                t.style.overflow = 'auto';
            }
        }

})();
