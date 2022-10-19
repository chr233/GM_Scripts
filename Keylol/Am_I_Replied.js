// ==UserScript==
// @name:zh-CN      我回过贴了吗
// @name            Am_I_Replied
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.0.0
// @description     判断是否已经回过贴
// @description:zh-CN  判断是否已经回过贴
// @author          Chr_
// @include         https://keylol.com/forum.php?*
// @include         https://keylol.com/t*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// ==/UserScript==

(async () => {
    "use strict";
    const userLink = document.querySelector("#nav-user-action-bar>ul>li.dropdown>a")?.href;
    if (!userLink) { return; }

    const userId = userLink.split("-")[1];

    let testUrl = location.href;

    if (location.search) {
        testUrl += `&authorid=${userId}`;
    } else {
        testUrl += `?authorid=${userId}`;
    }

    fetch(testUrl)
        .then(res => res.text())
        .then(html => {
            console.log(html);
            const text = html.includes("未定义操作") ? "❌还没回过贴子" : "✅已经回过贴了";
            const btnArea = document.getElementById("pgt");
            const span = document.createElement("span");
            span.textContent = text;
            btnArea.appendChild(span);
        });
})();
