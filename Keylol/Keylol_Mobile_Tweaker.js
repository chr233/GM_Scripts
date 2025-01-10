// ==UserScript==
// @name:zh-CN      Keylol_手机版优化
// @name            Keylol_Mobile_Tweaker
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.0
// @description     移除一些元素
// @description:zh-CN  移除一些元素
// @author          Chr_
// @match           https://keylol.com/*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// ==/UserScript==


(() => {
  "use strict";

  let rateBtns = document.querySelectorAll('a[href^="forum.php?mod=misc&action=postreview"],#fastpostform');
  if (rateBtns.length > 0) {
    for (let btn of rateBtns) {
      btn.style.display = "none"
    }
  }

})();
