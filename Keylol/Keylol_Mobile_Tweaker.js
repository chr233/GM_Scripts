// ==UserScript==
// @name:zh-CN      Keylol_手机版优化
// @name            Keylol_Mobile_Tweaker
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
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

  const isPc = !!document.querySelector('a[href="forum.php?mobile=yes"]')

  if (!isPc) {
    const replay = document.getElementById('fastpostform');
    if (replay) {
      replay.style.display = "none";
    }
  }

  tweakerBtns();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        tweakerBtns();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function tweakerBtns() {
    const rateBtns = document.querySelectorAll('div[id^="dppf"]>a');
    if (rateBtns.length > 0) {
      for (let btn of rateBtns) {
        const span = document.createElement('span');
        span.innerHTML = btn.innerHTML;
        span.style.margin = "0 3px";
        btn.parentNode.replaceChild(span, btn);
      }
    }

    const ratePcBtns = document.querySelectorAll('div.pob.cl>em>a');
    if (ratePcBtns.length > 0) {
      for (let btn of ratePcBtns) {
        const span = document.createElement('span');
        span.innerHTML = btn.innerHTML;
        span.className = btn.className;
        span.style.padding = "5px 10px 5px 25px";
        btn.parentNode.replaceChild(span, btn);
      }
    }
  }
})();
