// ==UserScript==
// @name         Sonkwo_Auto
// @name:zh-CN   杉果自动签到
// @namespace    https://blog.chrxw.com/
// @version      0.2
// @description  杉果自动签到
// @author       Chr_
// @license      AGPL-3.0
// @match        https://www.sonkwo.com/
// @grant        none
// ==/UserScript==

(function () {
    "use strict";
    setTimeout(() => {
        const sign = document.querySelector('div.store_user_card_action_check');
        if (sign && sign.textContent == '签到') {
            sign.click();
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
        const tasks = document.querySelectorAll('a[href$="task"]');
        for (let a of tasks) {
            a.href = a.href.replace('task', 'generaltask');
        }
    }, 2000);
})();