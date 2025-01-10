// ==UserScript==
// @name         Open_Links
// @name:zh-CN   自动打开链接
// @namespace    https://blog.chrxw.com
// @version      1.0
// @description  自动打开链接列表
// @author       Chr_
// @include      *
// @connect      steamcommunity.com
// @connect      steampowered.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    // 注册菜单项
    GM_registerMenuCommand('输入链接列表', openLinks);

    function openLinks() {
        // 弹出输入框
        const input = prompt('请输入网页链接列表，每行一个链接:');
        if (!input) return;

        // 解析输入的链接列表，排除空行和无效的URL
        const urls = input.split('\n').map(url => url.trim()).filter(url => isValidUrl(url));

        if (urls.length === 0) {
            alert('没有有效的链接');
            return;
        }

        // 打开链接
        openNextLink(urls);
    }

    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }

    function openNextLink(urls) {
        if (urls.length === 0) return;

        const url = urls.shift();
        const newTab = window.open(url, '_blank');

        // 监听标签页关闭事件
        const checkTabClosed = setInterval(() => {
            if (newTab.closed) {
                clearInterval(checkTabClosed);
                openNextLink(urls);
            }
        }, 1000);
    }
})();