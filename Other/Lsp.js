// ==UserScript==
// @name         自动+1
// @name:zh-CN   自动+1
// @namespace    https://blog.chrxw.com
// @version      1.0
// @description  从 steamdb.keylol.com 获取愿望单数据
// @author       Chr_
// @include      https://www.lspsp.me/bonus
// @icon         https://blog.chrxw.com/favicon.ico
// @license      AGPL-3.0
// ==/UserScript==

(() => {
  "use strict";

  const t = setInterval(async () => {
    const btns = document.querySelectorAll("div.links>button");
    const enableBtns = [...btns].filter(
      (x) => x.textContent.trim() === "免费领取" && !x.disabled
    );

    if (enableBtns.length > 0) {
      clearInterval(t);

      for (let btn of enableBtns) {
        btn.click();

        await aioSleep(5000);

        const closeBtn = document.querySelector("button.close-btn");
        const claimBtn = document.querySelector("div.window button.btn-1");

        if (claimBtn) {
          claimBtn.click();
          console.log("点击领取按钮");
          await aioSleep(5000);
        }

        if (closeBtn) {
          closeBtn.click();
        }
      }
    }
  }, 1000);

  setInterval(() => {
    location.reload();
  }, 10000);

  function aioSleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
})();

window.alert = function (msg) {
  console.log("[alert]", msg);
};
