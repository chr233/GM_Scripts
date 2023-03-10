// ==UserScript==
// @name:zh-CN      愿望单过滤器
// @name            Wishlist_Filter
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.2
// @description     愿望单游戏过滤器
// @description:zh-CN  愿望单游戏过滤器
// @author          Chr_
// @match           https://store.steampowered.com/wishlist/*
// @connect         steamcommunity.com
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_addStyle
// ==/UserScript==

// 初始化
(() => {
  "use strict";

  // 过滤器设置
  const filterConofig = [-1, -1, -1, -1];

  // 控件数组
  const domObj = {};

  addPanel();
  // 添加按钮
  function addPanel() {
    function genBtn(name, foo, tooltip) {
      const s = document.createElement("button");
      s.title = tooltip;
      s.textContent = name;
      s.addEventListener("click", foo);
      return s;
    }
    function genNumber(placeholder, title, value = 0, max = 100, min = 0) {
      const s = document.createElement("input");
      s.placeholder = placeholder;
      s.title = title;
      s.type = "number";
      s.value = value;
      s.max = max;
      s.min = min;
      return s;
    }
    function genDiv(cls) {
      const s = document.createElement("div");
      if (cls) {
        s.className = cls;
      }
      return s;
    }
    function genP() {
      const s = document.createElement("p");
      return s;
    }
    function genSpan(name) {
      const s = document.createElement("span");
      s.textContent = name;
      return s;
    }
    let divWsHeader = document.querySelector("div.wishlist_header");
    if (divWsHeader != null) {
      const btnDiv = genDiv("wf_panel");
      const btnHide = genBtn("重置过滤", resetFilter, "重置过滤器");
      const btnShow = genBtn("应用过滤", applyFilter, "应用过滤条件");
      const iptMinRate = genNumber("最低", "最低好评率", null, 100, 0);
      const iptMaxRate = genNumber("最高", "最高好评率", null, 100, 0);
      const iptMinRecommmend = genNumber("最低", "最低评价数", null, 99999, 0);
      const iptMaxRecommmend = genNumber("最高", "最高评价数", null, 99999, 0);
      const line1 = genP();
      line1.appendChild(genSpan("按好评率过滤:"));
      line1.appendChild(iptMinRate);
      line1.appendChild(iptMaxRate);
      line1.appendChild(btnHide);
      const line2 = genP();
      line2.appendChild(genSpan("按评价数过滤:"));
      line2.appendChild(iptMinRecommmend);
      line2.appendChild(iptMaxRecommmend);
      line2.appendChild(btnShow);
      btnDiv.appendChild(line1);
      btnDiv.appendChild(line2);
      divWsHeader.appendChild(btnDiv);

      Object.assign(domObj, {
        iptMinRate,
        iptMaxRate,
        iptMinRecommmend,
        iptMaxRecommmend,
      });

      loadConfig();
      loadInput();
    }
  }

  function resetFilter() {
    filterConofig[0] = -1;
    filterConofig[1] = -1;
    filterConofig[2] = -1;
    filterConofig[3] = -1;
    loadInput();
    saveConfig();
    for (let ele of document.querySelectorAll("#wishlist_ctn>div.wishlist_row")) {
      filterGame(ele);
    }
  }

  function applyFilter() {
    saveInput();
    saveConfig();
    for (let ele of document.querySelectorAll("#wishlist_ctn>div.wishlist_row")) {
      filterGame(ele);
    }
  }

  //处理数字
  function tryParseInt(value) {
    const x = parseInt(value);
    return x !== x ? -1 : x;
  }

  //加载输入
  function loadInput() {
    const { iptMinRate, iptMaxRate, iptMinRecommmend, iptMaxRecommmend } =
      domObj;
    iptMinRate.value = filterConofig[0] === -1 ? "" : filterConofig[0];
    iptMaxRate.value = filterConofig[1] === -1 ? "" : filterConofig[1];
    iptMinRecommmend.value = filterConofig[2] === -1 ? "" : filterConofig[2];
    iptMaxRecommmend.value = filterConofig[3] === -1 ? "" : filterConofig[3];
  }

  //读取输入
  function saveInput() {
    const { iptMinRate, iptMaxRate, iptMinRecommmend, iptMaxRecommmend } =
      domObj;

    filterConofig[0] = tryParseInt(iptMinRate.value);
    filterConofig[1] = tryParseInt(iptMaxRate.value);
    filterConofig[2] = tryParseInt(iptMinRecommmend.value);
    filterConofig[3] = tryParseInt(iptMaxRecommmend.value);
  }

  //加载设置
  function loadConfig() {
    filterConofig[0] = tryParseInt(window.localStorage["wf_min_rate"]);
    filterConofig[1] = tryParseInt(window.localStorage["wf_max_rate"]);
    filterConofig[2] = tryParseInt(window.localStorage["wf_min_rec"]);
    filterConofig[3] = tryParseInt(window.localStorage["wf_max_rec"]);
  }
  //保存设置
  function saveConfig() {
    window.localStorage["wf_min_rate"] =
      filterConofig[0] === -1 ? "" : filterConofig[0];
    window.localStorage["wf_max_rate"] =
      filterConofig[1] === -1 ? "" : filterConofig[1];
    window.localStorage["wf_min_rec"] =
      filterConofig[2] === -1 ? "" : filterConofig[2];
    window.localStorage["wf_max_rec"] =
      filterConofig[3] === -1 ? "" : filterConofig[3];
  }

  const matchReview = RegExp(/([0-9,.]+%?) \D+ ([0-9,.]+%?)/);
  const matchDot = RegExp(/[,.]/g);

  function matchText(text) {
    const match = text.match(matchReview);

    let rate = -1;
    let recomment = -1;

    if (match != null) {
      const [_, v1, v2] = match;
      if (v1.endsWith("%")) {
        rate = tryParseInt(v1.substring(0, v1.length - 1).replace(matchDot, ""));
        recomment = tryParseInt(v2);
      } else {
        rate = tryParseInt(v2.substring(0, v2.length - 1).replace(matchDot, ""));
        recomment = tryParseInt(v1);
      }
    }
    return [rate, recomment];
  }

  function parseGame(ele) {
    const review = ele
      .querySelector("div.game_review_summary")
      ?.getAttribute("data-tooltip-text");
    const [ramin, ramax, remin, remax] = filterConofig;
    if (
      (remin === -1 && remax === -1 && ramin === -1 && ramax === -1) ||
      review == null
    ) {
      return true;
    }

    const [rate, recomment] = matchText(review);

    if (rate !== -1) {
      if (ramin !== -1 && rate < ramin) {
        return false;
      }
      if (ramax !== -1 && rate > ramax) {
        return false;
      }
    }

    if (recomment !== -1) {
      if (remin !== -1 && recomment < remin) {
        return false;
      }
      if (remax !== -1 && recomment > remax) {
        return false;
      }
    }

    return true;
  }

  function filterGame(ele) {
    const clsList = ele.classList;
    if (parseGame(ele)) {
      clsList.remove("wf_hide");
    } else {
      clsList.add("wf_hide");
    }
  }

  //过滤游戏列表
  let timer = setInterval(() => {
    let container = document.getElementById("wishlist_ctn");
    if (container != null) {
      clearInterval(timer);

      for (let ele of container.querySelectorAll("div.wishlist_row")) {
        filterGame(ele);
      }
      container.addEventListener("DOMNodeInserted", ({ relatedNode }) => {
        if (relatedNode.nodeName === "DIV") {
          for (let ele of relatedNode.querySelectorAll("div.wishlist_row")) {
            filterGame(ele);
          }
        }
      });
    }
  }, 500);
})();

GM_addStyle(`
div.wf_panel {
    position: absolute;
    right: 0;
  }
  
  div.wf_panel > p > button {
    padding: 0 10px;
  }
  div.wf_panel > p > input {
    width: 50px;
  }
  div.wf_panel > p > *:not(:last-child) {
    margin-right: 10px;
  }
  
  #wishlist_ctn > div.wf_hide {
    opacity: 0.3;
  }
  
`);
