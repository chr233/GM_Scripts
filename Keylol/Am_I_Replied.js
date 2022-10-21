// ==UserScript==
// @name:zh-CN      我回过贴了吗
// @name            Am_I_Replied
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.3
// @description     判断是否已经回过贴
// @description:zh-CN  判断是否已经回过贴
// @author          Chr_
// @include         https://keylol.com/forum.php?*
// @include         https://keylol.com/t*
// @include         https://bbs.nga.cn/read.php?*
// @include         https://ngabbs.com/read.php?*
// @include         https://nga.178.com/read.php?*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// ==/UserScript==

(async () => {
    "use strict";

    if ((location.pathname === "/forum.php" && !location.search.includes("tid")) || location.search.includes("authorid")) {
        return;
    }

    const userId = typeof discuz_uid != 'undefined' ? discuz_uid : __CURRENT_UID;

    let testUrl = location.href;

    if (location.search) {
        testUrl += `&authorid=${userId}`;
    } else {
        testUrl += `?authorid=${userId}`;
    }

    fetch(testUrl)
        .then((res) => res.text())
        .then((html) => {
            const replied = !(html.includes("未定义操作") || html.includes("ERROR:"));
            const btnArea = document.querySelector("#pgt, #m_nav>.nav");
            const text = replied ? "✅已经回过贴了" : "❌还没回过贴子";
            const tips = document.createElement("a");
            tips.textContent = text;
            if (replied) {
                tips.href = testUrl;
            }
            else {
                tips.addEventListener("click", () => {
                    showError("❌还没回过贴子");
                });
            }
            btnArea.appendChild(tips);
        });
})();
