// ==UserScript==
// @name:zh-CN      Steam展柜上传小工具
// @name            Image_Upload_Tools
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.15
// @description     在商店页显示双语游戏名称，双击名称可以快捷搜索。
// @description:zh-CN  在商店页显示双语游戏名称，双击名称可以快捷搜索。
// @author          Chr_
// @include         /https://steamcommunity\.com\/sharedfiles\/edititem\/.+/
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_addStyle
// ==/UserScript==


(() => {
    'use strict';

    const form = document.getElementById("SubmitItemForm");

    const inputs = form.querySelectorAll("input[type=hidden]");

    for (let input of inputs) {
        input.type ="text";
    }

})();