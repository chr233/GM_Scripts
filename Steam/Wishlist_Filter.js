// ==UserScript==
// @name:zh-CN      愿望单过滤器
// @name            Wishlist_Filter
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.5
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
  const filterConofig = [-1, -1, -1, -1, -1, -1, -1, -1];

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
      btnDiv.addEventListener('click', (e) => {
        e.preventDefault();
      });

      const btnReset = genBtn("重置过滤", resetFilter, "重置过滤器");
      const btnApply = genBtn("应用过滤", applyFilter, "应用过滤条件");
      const iptMinRate = genNumber("最低", "最低好评率", null, 100, 0);
      const iptMaxRate = genNumber("最高", "最高好评率", null, 100, 0);
      const iptMinRecommmend = genNumber("最低", "最低评价数", null, 99999, 0);
      const iptMaxRecommmend = genNumber("最高", "最高评价数", null, 99999, 0);
      const iptMinDiscount = genNumber("最低", "最低折扣", null, 100, 0);
      const iptMaxDiscount = genNumber("最高", "最高折扣", null, 100, 0);
      const iptMinPrice = genNumber("最低", "最低价格", null, 99999, 0);
      const iptMaxPrice = genNumber("最高", "最高加个", null, 99999, 0);
      const line1 = genP();
      line1.appendChild(genSpan("按好评率:"));
      line1.appendChild(iptMinRate);
      line1.appendChild(iptMaxRate);
      line1.appendChild(genSpan("按折扣:"));
      line1.appendChild(iptMinDiscount);
      line1.appendChild(iptMaxDiscount);
      const line2 = genP();
      line2.appendChild(genSpan("按评价数:"));
      line2.appendChild(iptMinRecommmend);
      line2.appendChild(iptMaxRecommmend);
      line2.appendChild(genSpan("按价格:"));
      line2.appendChild(iptMinPrice);
      line2.appendChild(iptMaxPrice);
      const line3 = genP();
      line3.appendChild(btnReset);
      line3.appendChild(btnApply);
      btnDiv.appendChild(line1);
      btnDiv.appendChild(line2);
      btnDiv.appendChild(line3);
      divWsHeader.appendChild(btnDiv);

      Object.assign(domObj, {
        iptMinRate,
        iptMaxRate,
        iptMinRecommmend,
        iptMaxRecommmend,
        iptMinDiscount,
        iptMaxDiscount,
        iptMinPrice,
        iptMaxPrice,
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
    filterConofig[4] = -1;
    filterConofig[5] = -1;
    filterConofig[6] = -1;
    filterConofig[7] = -1;
    loadInput();
    saveConfig();
    for (let ele of document.querySelectorAll(
      "#wishlist_ctn>div.wishlist_row"
    )) {
      filterGame(ele);
    }
  }

  function applyFilter() {
    saveInput();
    saveConfig();
    for (let ele of document.querySelectorAll(
      "#wishlist_ctn>div.wishlist_row"
    )) {
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
    const {
      iptMinRate,
      iptMaxRate,
      iptMinRecommmend,
      iptMaxRecommmend,
      iptMinDiscount,
      iptMaxDiscount,
      iptMinPrice,
      iptMaxPrice,
    } = domObj;
    iptMinRate.value = filterConofig[0] === -1 ? "" : filterConofig[0];
    iptMaxRate.value = filterConofig[1] === -1 ? "" : filterConofig[1];
    iptMinRecommmend.value = filterConofig[2] === -1 ? "" : filterConofig[2];
    iptMaxRecommmend.value = filterConofig[3] === -1 ? "" : filterConofig[3];
    iptMinDiscount.value = filterConofig[4] === -1 ? "" : filterConofig[4];
    iptMaxDiscount.value = filterConofig[5] === -1 ? "" : filterConofig[5];
    iptMinPrice.value = filterConofig[6] === -1 ? "" : filterConofig[6];
    iptMaxPrice.value = filterConofig[7] === -1 ? "" : filterConofig[7];
  }

  //读取输入
  function saveInput() {
    const {
      iptMinRate,
      iptMaxRate,
      iptMinRecommmend,
      iptMaxRecommmend,
      iptMinDiscount,
      iptMaxDiscount,
      iptMinPrice,
      iptMaxPrice,
    } = domObj;

    filterConofig[0] = tryParseInt(iptMinRate.value);
    filterConofig[1] = tryParseInt(iptMaxRate.value);
    filterConofig[2] = tryParseInt(iptMinRecommmend.value);
    filterConofig[3] = tryParseInt(iptMaxRecommmend.value);
    filterConofig[4] = tryParseInt(iptMinDiscount.value);
    filterConofig[5] = tryParseInt(iptMaxDiscount.value);
    filterConofig[6] = tryParseInt(iptMinPrice.value);
    filterConofig[7] = tryParseInt(iptMaxPrice.value);
  }

  //加载设置
  function loadConfig() {
    filterConofig[0] = tryParseInt(localStorage["wf_min_rate"]);
    filterConofig[1] = tryParseInt(localStorage["wf_max_rate"]);
    filterConofig[2] = tryParseInt(localStorage["wf_min_rec"]);
    filterConofig[3] = tryParseInt(localStorage["wf_max_rec"]);
    filterConofig[4] = tryParseInt(localStorage["wf_min_discount"]);
    filterConofig[5] = tryParseInt(localStorage["wf_max_discount"]);
    filterConofig[6] = tryParseInt(localStorage["wf_min_price"]);
    filterConofig[7] = tryParseInt(localStorage["wf_max_price"]);
  }
  //保存设置
  function saveConfig() {
    localStorage["wf_min_rate"] =
      filterConofig[0] === -1 ? "" : filterConofig[0];
    localStorage["wf_max_rate"] =
      filterConofig[1] === -1 ? "" : filterConofig[1];
    localStorage["wf_min_rec"] =
      filterConofig[2] === -1 ? "" : filterConofig[2];
    localStorage["wf_max_rec"] =
      filterConofig[3] === -1 ? "" : filterConofig[3];
    localStorage["wf_min_discount"] =
      filterConofig[4] === -1 ? "" : filterConofig[4];
    localStorage["wf_max_discount"] =
      filterConofig[5] === -1 ? "" : filterConofig[5];
    localStorage["wf_min_price"] =
      filterConofig[6] === -1 ? "" : filterConofig[6];
    localStorage["wf_max_price"] =
      filterConofig[7] === -1 ? "" : filterConofig[7];
  }

  const matchReview = RegExp(/([0-9,.]+%?) \D+ ([0-9,.]+%?)/);
  const matchDot = RegExp(/[,.]/g);

  //解析评测结果
  function parseReviewText(text) {
    let rate = -1;
    let recomment = -1;

    const match = text.match(matchReview);
    if (match) {
      const [_, v1, v2] = match;
      if (v1.endsWith("%")) {
        rate = tryParseInt(
          v1.substring(0, v1.length - 1).replace(matchDot, "")
        );
        recomment = tryParseInt(v2.replace(matchDot, ""));
      } else {
        rate = tryParseInt(
          v2.substring(0, v2.length - 1).replace(matchDot, "")
        );
        recomment = tryParseInt(v1.replace(matchDot, ""));
      }
    }
    return [rate, recomment];
  }

  const matchDiscount = RegExp(/-([0-9]+)%/);

  function parseDiscount(text) {
    const match = text.match(matchDiscount);
    if (match) {
      const [_, v1] = match;
      return tryParseInt(v1);
    }
    return -1;
  }

  const matchPrice = RegExp(/((?:\d\d?\d?)(?:[\d,.]\d\d\d)?)(?:[,.]\d\d?)?/);

  function parsePrice(text) {
    const match = text.match(matchPrice);
    if (match) {
      const [_, v1] = match;
      return tryParseInt(v1.replace(matchDot, ""));
    }
  }

  function parseGame(ele) {
    const [ramin, ramax, remin, remax, dmin, dmax, pmin, pmax] = filterConofig;

    if (remin !== -1 || remax !== -1 || ramin !== -1 || ramax !== -1) {
      const review = ele
        .querySelector("div.game_review_summary")
        ?.getAttribute("data-tooltip-text");

      if (review) {
        const [ra, rec] = parseReviewText(review);

        if (ra !== -1) {
          if ((ramin !== -1 && ra < ramin) || (ramax !== -1 && ra > ramax)) {
            return false;
          }
        }

        if (rec !== -1) {
          if ((remin !== -1 && rec < remin) || (remax !== -1 && rec > remax)) {
            return false;
          }
        }
      }
    }

    if (dmin !== -1 || dmax !== -1) {
      const discount = ele.querySelector("div.discount_pct")?.textContent;

      if (discount) {
        const d = parseDiscount(discount);

        if (d !== -1) {
          if ((dmin !== -1 && d < dmin) || (dmax !== -1 && d > dmax)) {
            return false;
          }
        }
      }
    }

    if (pmin !== -1 || pmax !== -1) {
      const price = ele.querySelector("div.discount_final_price")?.textContent;
      if (price) {
        const p = parsePrice(price);

        console.log(price, p);

        if (p !== -1) {
          if ((pmin !== -1 && p < pmin) || (pmax !== -1 && p > pmax)) {
            return false;
          }
        }
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
