// ==UserScript==
// @name         评论抓取
// @name:zh-CN   评论抓取
// @namespace    https://blog.chrxw.com
// @version      1.0
// @description  从steamdb.keylol.com获取愿望单数据
// @author       Chr_
// @include      https://www.bilibili.com/video/*
// @icon         https://blog.chrxw.com/favicon.ico
// @license      AGPL-3.0
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  "use strict";
  const commentList = new Set();

  console.log("load");

  GM_registerMenuCommand("复制评论内容", copyLinks);

  function copyLinks() {
    const list = [...commentList];
    const value = list.join("\r\n");
    GM_setClipboard(value, "text");
  }

  setInterval(() => {
    const eles = document
      .querySelector("#commentapp > bili-comments")
      .shadowRoot.querySelectorAll("#feed > bili-comment-thread-renderer");

    for (let ele of eles) {
      const comment = ele?.shadowRoot
        ?.querySelector("#comment")
        ?.shadowRoot?.querySelector("div#main div#content>bili-rich-text")
        ?.shadowRoot?.querySelector("p>span")
        ?.textContent.replace(/\s/g,"");

      if (comment && !commentList.has(comment)) {
        console.log(comment);
        commentList.add(comment);
      }
    }
  }, 1000);
})();
