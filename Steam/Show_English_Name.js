// ==UserScript==
// @name         Show_English_Name
// @name:zh-CN   Steam显示英文游戏名
// @namespace    https://blog.chrxw.com
// @version      1.2
// @description  在商店页显示双语游戏名称，点击名称可以复制。
// @description:zh-CN  在商店页显示双语游戏名称，点击名称可以复制。
// @author       Chr_
// @include      /https://store\.steampowered\.com\/app\/\d+/
// @require      https://greasyfork.org/scripts/431423-async-requests/code/Async_Requests.js
// @connect      store.steampowered.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// ==/UserScript==


(() => {
    'use strict';

    let appid = (window.location.pathname.match(/\/app\/(\d+)/) ?? [null, null])[1];

    if (appid === null) { return; }

    $http.get(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=english`)
        .then(json => {

            let data = json[appid];

            if (data.success !== true) { return; }

            let en_title = data.data.name;

            en_title = en_title.replace(/ on Steam$/, '');

            let t = setInterval(() => {
                let ele = document.getElementById('appHubAppName');
                if (ele != null) {
                    clearInterval(t);
                    let raw_title = ele.textContent
                    if (raw_title.toLowerCase() != en_title.toLowerCase()) {
                        ele.textContent = `${raw_title} (${en_title})`;
                        ele.title = '点击复制';
                    }
                    ele.addEventListener('click', () => {
                        GM_setClipboard(ele.textContent, { type: 'text', mimetype: 'text/plain' });
                    });
                }
            }, 500);
        })
        .catch(err => {
            console.error(err);
        });
})();

