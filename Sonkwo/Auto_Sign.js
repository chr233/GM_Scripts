// ==UserScript==
// @name         Sonkwo_Auto
// @namespace    https://blog.chrxw.com/
// @version      0.1
// @description  杉果自动签到
// @author       Chr_
// @license      AGPL-3.0
// @match        https://www.sonkwo.com/
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    window.onload = () => {
        let sign = document.querySelector('div.store_user_card_action_check');
        if (sign && sign.textContent=='签到') {
            sign.click();
        }
    }
})();