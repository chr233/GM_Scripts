// ==UserScript==
// @name:zh-CN      GMG小绿人Steam快捷搜索
// @name            GMG_Steam_Search
// @namespace       https://blog.chrxw.com/
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @icon            https://blog.chrxw.com/favicon.ico
// @version         1.6
// @description     快捷搜索steam商店
// @description:zh-CN  快捷搜索steam商店
// @author          Chr_
// @license         AGPL-3.0
// @connect         steampowered.com
// @match           https://www.greenmangaming.com/*/games/*
// @match           https://www.greenmangaming.com/games/*
// @require         https://greasyfork.org/scripts/431430-search-steam-store/code/Search_Steam_Store.js
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @grant           GM_registerMenuCommand
// ==/UserScript==

(() => {
  "use strict";
  const auto = window.localStorage["gs_auto"] ?? "关";

  const GdivResult = [null, null]; //控件数组
  let i = 0;
  let t = setInterval(() => {
    const title1 = document.querySelector("div[class^=visible]>#pdp-title>h1.notranslate");
    const describe1 = document.querySelector("div[class^=visible]>#pdp-title>ul.navigate-options");
    const title2 = document.querySelector("div[class*=hidden]>#pdp-title>h1.notranslate");
    const describe2 = document.querySelector("div[class*=hidden]>#pdp-title>ul.navigate-options");
    if (title1 !== null) {
      init(title1, describe1, 0);
    }
    if (title2 !== null) {
      init(title2, describe2, 1);
    }
    if ((GdivResult[0] !== null && GdivResult[1] !== null) || i++ >= 10) {
      clearInterval(t);
    }
  }, 500);

  //显示搜索按钮
  function init(title, describe, which) {
    const keyword = title.textContent.replace(/[-+=:;：；""‘’“”]/g, " ");
    const btnSearch = document.createElement("button");
    btnSearch.className = "btnSearch";
    btnSearch.textContent = "🔎";
    btnSearch.addEventListener("mouseover", () => { btnSearch.textContent = "🔎 搜索Steam"; });
    btnSearch.addEventListener("mouseout", () => { btnSearch.textContent = "🔎"; });
    btnSearch.addEventListener("click", () => { showResult(keyword); });

    (describe ?? title).appendChild(btnSearch);
    const divResult = document.createElement("div");
    divResult.className = "divResult";
    divResult.style.display = "none";
    title.appendChild(divResult);

    GdivResult[which] = divResult;

    if (auto === "开" && which == 1) {
      btnSearch.click();
    }
  }

  //显示搜索结果
  function showResult(keyword) {
    const [divResult1, divResult2] = GdivResult;
    searchStore(keyword, "CN")
      .then((result) => {
        divResult1.innerHTML = "";
        divResult2.innerHTML = "";
        divResult1.style.display = "";
        divResult2.style.display = "";
        if (result.length === 0) {
          const btnRst = document.createElement("button");
          btnRst.textContent = "【快速搜索无结果,点击前往steam搜索页】";
          btnRst.addEventListener("click", () => { window.open(`https://store.steampowered.com/search/?term=${keyword}`); });
          divResult1.appendChild(btnRst);
          divResult2.appendChild(btnRst);
          return;
        }
        for (const { appID, isBundle, appName, appPrice, appUrl, appImg } of result) {
          const btnRst = document.createElement("button");
          btnRst.title = `${isBundle ? "bundle" : "app"}/${appID}`;
          btnRst.addEventListener("click", () => { window.open(appUrl); });

          const btnName = document.createElement("p");
          btnName.textContent = `${appName}【${appPrice}】`;
          btnRst.appendChild(btnName);
          btnRst.appendChild(document.createElement("br"));

          const btnImg = new Image();
          btnImg.src = appImg;

          btnRst.appendChild(btnImg);
          divResult1.appendChild(btnRst);
          divResult2.appendChild(btnRst);
        }
      })
      .catch((reason) => {
        alert(reason);
      });
  }

  GM_registerMenuCommand(`自动搜索：【${auto}】`, () => {
    window.localStorage["gs_auto"] = auto === "开" ? "关" : "开";
  });
})();


//CSS表
GM_addStyle(`
.divResult {
  top: 0;
  position: relative;
  width: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
  white-space: nowrap;
}
.divResult > button {
  cursor: pointer;
  color: #000;
  font-size: 15px;
}
.divResult > button:not(:last-child) {
  margin-right: 5px;
}
.divResult > button > p {
  display: inline;
  margin-left: 6px;
}
.divResult > button > img {
  zoom: 1.5;
  margin-top: 2px;
}
.btnSearch {
  padding: 1px;
  color: #000;
  font-size: 10px;
}
`);