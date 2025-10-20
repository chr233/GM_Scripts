// ==UserScript==
// @name:zh-CN      鉴赏家发帖修复
// @name            Curator_Post_Fix
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
// @version         1.0
// @description     功能修复
// @description:zh-CN  功能修复
// @author          Chr_
// @include         https://store.steampowered.com/curator/*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// ==/UserScript==

// 初始化
(() => {
  "strict";
  const eleContainer = document.getElementById("subpage_container");
  if (eleContainer) {
    const observer = new MutationObserver(onPageLoad);
    observer.observe(eleContainer, { childList: true, subtree: true });
  }

  let lastPathname = "";

  function onPageLoad() {
    if (lastPathname == location.pathname) {
      return;
    }
    lastPathname = location.pathname;

    injectReviewCreate();
  }

  onPageLoad();

  function injectReviewCreate() {
    const [_, curatorId] = lastPathname.match(
      /\/curator\/(\d+)-(?:[^\/]+)\/admin\/review_create/
    ) ?? [null, null];

    if (curatorId) {
      g_strCuratorAdminURL = `https://store.steampowered.com/curator/${curatorId}/admin/`
      console.log(g_strCuratorAdminURL);
    }
  }

})();
