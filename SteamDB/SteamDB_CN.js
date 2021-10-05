// ==UserScript==
// @name                SteamDB_CN
// @name:zh-CN          SteamDB汉化
// @namespace           https://blog.chrxw.com
// @version             1.2
// @description         SteamDB汉化插件(修改自Github-i18n)
// @description:zh-cn   SteamDB汉化插件(修改自Github-i18n)
// @author              Chr_
// @match               https://steamdb.info/*
// @grant               GM_xmlhttpRequest
// @grant               GM_getResourceText
// @resource            data https://gitee.com/chr_a1/gm_scripts/raw/master/SteamDB/lang_zh_CN.json
// ==/UserScript==



(function() {
  'use strict';

  const locales = JSON.parse(GM_getResourceText("data"));

  // translateByCssSelector();
  // translateDesc(".repository-content .f4"); //仓库简介翻译
  // translateDesc(".gist-content [itemprop='about']"); // Gist 简介翻译
  traverseElement(document.body);
  watchUpdate();
  
  function translateElement(el) {
    // Get the text field name
    let k;
    if(el.tagName === "INPUT") {
      if (el.type === 'button' || el.type === 'submit') {
        k = 'value';
      } else {
        k = 'placeholder';
      }
    } else {
      k = 'data';
    }

    const txtSrc = el[k].trim();
    const key = txtSrc.toLowerCase()
        .replace(/\xa0/g, ' ') // replace '&nbsp;'
        .replace(/\s{2,}/g, ' ');

    if(locales.dict[key]) {
      el[k] = el[k].replace(txtSrc, locales.dict[key])
    }
  }

  function shoudTranslateEl(el) {
    const blockIds = ["readme", "wiki-content"];
    const blockClass = [
      "CodeMirror",
      "css-truncate", // 过滤文件目录
      "blob-code"
    ];
    const blockTags = ["CODE", "SCRIPT", "LINK", "IMG", "svg", "TABLE", "ARTICLE", "PRE"];
    const blockItemprops = ["name"];

    if(blockTags.includes(el.tagName)) {
      return false;
    }

    if(el.id && blockIds.includes(el.id)) {
      return false;
    }

    if(el.classList) {
      for(let clazz of blockClass) {
        if(el.classList.contains(clazz)) {
          return false;
        }
      }
    }

    if(el.getAttribute) {
      let itemprops = el.getAttribute("itemprop");
      if(itemprops) {
        itemprops = itemprops.split(" ");
        for(let itemprop of itemprops) {
          console.log(itemprop)
          if(blockItemprops.includes(itemprop)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  function traverseElement(el) {
    if(!shoudTranslateEl(el)) {
      return
    }

    for(const child of el.childNodes) {
      // if(["RELATIVE-TIME", "TIME-AGO"].includes(el.tagName)) {
      //   translateRelativeTimeEl(el);
      //   return;
      // }

      if(child.nodeType === Node.TEXT_NODE) {
        translateElement(child);
      }
      else if(child.nodeType === Node.ELEMENT_NODE) {
        if(child.tagName === "INPUT") {
          // translateElement(child);
        } else {
          traverseElement(child);
        }
      } else {
        // pass
      }
    }
  }

  function watchUpdate() {
    const m = window.MutationObserver || window.WebKitMutationObserver;
    const observer = new m(function (mutations, observer) {
      for(let mutationRecord of mutations) {
        for(let node of mutationRecord.addedNodes) {
          traverseElement(node);
        }
      }
    });

    observer.observe(document.body, {
      subtree: true,
      characterData: true,
      childList: true,
    });
  }
})();