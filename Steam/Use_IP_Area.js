// ==UserScript==
// @name         Use_IP_Area
// @name:zh-CN   快速换区
// @namespace    https://blog.chrxw.com
// @version      1.7
// @description  在商店页显示双语游戏名称，双击名称可以快捷搜索。
// @description:zh-CN  在商店页显示双语游戏名称，双击名称可以快捷搜索。
// @author       Chr_
// @match        https://store.steampowered.com/*
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_registerMenuCommand
// ==/UserScript==


(() => {
    'use strict';

    let useIP = document.cookie.indexOf('UseIP') !== -1;

    console.log(document.cookie.indexOf('UseIP'));
    console.log(useIP);


    // GM_registerMenuCommand(`切换显示格式：【${mode === 'c(e)' ? '原名 (英文名)' : '英文名 (原名)'}】`, () => {
    //     window.localStorage['sen_mode'] = mode === 'c(e)' ? 'e(c)' : 'c(e)';
    //     window.location.reload();
    // })


})();
