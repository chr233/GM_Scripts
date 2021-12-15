// ==UserScript==
// @name                SteamDB_CN
// @name:zh-CN          SteamDB汉化
// @namespace           https://blog.chrxw.com
// @version             1.0
// @description         SteamDB汉化插件
// @description:zh-cn   SteamDB汉化插件
// @author              Chr_
// @match               https://steamdb.info/*
// @grant               GM_getResourceText
// ==/UserScript==



(function () {
  'use strict';
  const DEBUG = true;

  const locales = JSON.parse(GM_getResourceText("data"));

  for (const [css, dic] of Object.entries(locales.STATIC)) {
    console.log(`〖${css}〗`);
    const elements = document.querySelectorAll(css);
    if (elements.length > 0) {
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.childElementCount === 0) {//节点内部无其他元素
          const raw = element.innerText;
          if (!raw || raw.length <= 2) { continue; }
          const txt = dic[raw];
          if (txt) {
            element.innerText = txt;
          } else if (DEBUG) {
            console.log(`"${raw}": "",`);
          }
        } else {//节点内部有其他元素
          const nodes = element.childNodes;
          for (let j = 0; j < nodes.length; j++) {
            const node = nodes[j];
            if (node.nodeType === Node.TEXT_NODE) {
              const raw = node.textContent;
              if (!raw || raw.length <= 2) { continue; }
              const txt = dic[raw];
              if (txt) {
                node.textContent = txt;
              } else if (DEBUG) {
                console.log(`"${raw}": "",`);
              }
            }
          }
        }
      }
    }
  }

  const m = window.MutationObserver || window.WebKitMutationObserver;
  // 当观察到变动时执行的回调函数
  const callback = (mutationsList, observer) => {
    // Use traditional 'for loops' for IE 11
    for (let mutation of mutationsList) {

      console.log(mutation);

    }
  };

  // 创建一个观察器实例并传入回调函数
  const observer = new m(callback);

  // 以上述配置开始观察目标节点
  observer.observe(document.body, { childList: true, subtree: true });

  // 之后，可停止观察
  observer.disconnect();





})();