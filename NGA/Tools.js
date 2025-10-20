// ==UserScript==
// @name:zh-CN      复制工具
// @name            Copy Tools
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
// @version         1.0
// @description     复制文本
// @description:zh-CN  判断是否已经回过贴
// @author          Chr_
// @include         https://bbs.nga.cn/read.php?*
// @include         https://ngabbs.com/read.php?*
// @include         https://nga.178.com/read.php?*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_setClipboard
// ==/UserScript==

(async () => {
  "use strict";

  function copyTexts(text) {
    GM_setClipboard(text, "text");
  }

  document.querySelectorAll("span.postinfot.postdatec.stxt,a[name='uid']").forEach((ele) => {
    const text = ele.textContent.trim();
    ele.addEventListener("click", () => {
      copyTexts(text);
    });
  });

})();
