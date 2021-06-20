// ==UserScript==
// @name         Boosterpack_Link
// @name:zh-CN   补充包制作器快捷方式
// @namespace    https://blog.chrxw.com
// @version      1.0
// @description  Steam补充包制作器快捷方式
// @description:zh-CN  Steam补充包制作器快捷方式
// @author       Chr_
// @include      /https://steamcommunity\.com/(id|profiles)/[^\/]+/gamecards/(\d+)/?$/
// @include      /https://steamcommunity\.com/(id|profiles)/[^\/]+/badges/?$/
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// ==/UserScript==

window.addEventListener('load', () => {
    'use strict';
    const blackList = ['1658760'];

    if (window.location.pathname.search('gamecards') === -1) {

        let rows = document.querySelectorAll('div.badges_sheet > div.badge_row');
        rows.forEach((ele) => {
            let link = ele.querySelector('a.badge_row_overlay');

            if (link !== null) {

                let appid = link.href.match(/gamecards\/(\d+)/);

                appid = appid ? appid[1] : -1;
                if (appid < 0) {
                    console.log('获取appid失败');
                } else if (blackList.indexOf(appid) > -1) {
                    console.log('跳过黑名单');
                } else {
                    let btn = document.createElement('button');

                    btn.style.cssText = 'position: absolute;right: 300px;top: 10px;z-index: 99;'
                    btn.addEventListener('click', () => {
                        window.open(`https://steamcommunity.com/tradingcards/boostercreator/#${appid}`);
                    });
                    btn.textContent = '我要做包';

                    ele.appendChild(btn);
                }
            }
        });
    } else {
        let title = document.querySelector('div.badge_title');
        let appid = window.location.pathname.match(/gamecards\/(\d+)/);

        appid = appid ? appid[1] : -1;
        if (appid < 0) {
            console.log('获取appid失败');
        } else if (blackList.indexOf(appid) > -1) {
            console.log('跳过黑名单');
        } else {
            let btn = document.createElement('button');

            btn.style.cssText = 'position: absolute;right: 300px;top: 10px;z-index: 99;'
            btn.addEventListener('click', () => {
                window.open(`https://steamcommunity.com/tradingcards/boostercreator/#${appid}`);
            });
            btn.textContent = '我要做包';

            title.appendChild(btn);
        }
    }
});
