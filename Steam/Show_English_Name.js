// ==UserScript==
// @name         Show_English_Name
// @name:zh-CN   Steam显示英文游戏名
// @namespace    https://blog.chrxw.com
// @version      1.7
// @description  在商店页显示双语游戏名称，双击名称可以快捷搜索。
// @description:zh-CN  在商店页显示双语游戏名称，双击名称可以快捷搜索。
// @author       Chr_
// @include      /https://store\.steampowered\.com\/app\/\d+/
// @require      https://greasyfork.org/scripts/431423-async-requests/code/Async_Requests.js
// @connect      store.steampowered.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// ==/UserScript==


(() => {
    'use strict';
    let mode = window.localStorage['sen_mode'] ?? 'c(e)';
    let pure = window.localStorage['sen_pure'] ?? '关';
    let appid = (window.location.pathname.match(/\/app\/(\d+)/) ?? [null, null])[1];
    if (appid === null) { return; }
    $http.get(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=english`)
        .then(json => {
            let data = json[appid];
            if (data.success !== true) { return; }
            let name_en = data.data.name;
            let t = setInterval(() => {
                let ele_title = document.getElementById('appHubAppName');
                if (ele_title != null) {
                    clearInterval(t);
                    let ele_path = document.querySelector('div.blockbg>a:last-child');
                    let name_cur = ele_title.textContent
                    if (name_cur.toLowerCase() != name_en.toLowerCase()) {
                        if (pure === '开') {
                            name_en = pureName(name_en);
                            name_cur = pureName(name_cur);
                        }
                        let name_new = '';
                        if (mode === 'e(c)') {
                            name_new = `${name_en} (${name_cur})`;
                        } else {
                            name_new = `${name_cur} (${name_en})`;
                        }
                        ele_title.textContent = name_new;
                        if (ele_path !== null) {
                            ele_path.textContent = name_new;
                        }
                    }
                    ele_title.title = '双击快捷搜索';
                    ele_title.addEventListener('dblclick', () => {
                        ShowConfirmDialog(`要使用的搜索关键词？`, '', name_cur, name_en)
                            .done(() => {
                                window.open(`https://store.steampowered.com/search/?term=${name_cur}`);
                            })
                            .fail((stats) => {
                                if (stats) {
                                    window.open(`https://store.steampowered.com/search/?term=${name_en}`);
                                }
                            })
                    });
                }
            }, 500);
        })
        .catch(err => {
            console.error(err);
        });
    GM_registerMenuCommand(`切换显示格式：【${mode === 'c(e)' ? '原名 (英文名)' : '英文名 (原名)'}】`, () => {
        window.localStorage['sen_mode'] = mode === 'c(e)' ? 'e(c)' : 'c(e)';
        window.location.reload();
    })
    GM_registerMenuCommand(`过滤特殊符号：【${pure}】`, () => {
        window.localStorage['sen_pure'] = pure === '开' ? '关' : '开';
        window.location.reload();
    })
    function pureName(str) {
        return str.replace(/[《》™©®]/g, '');
    }
})();
