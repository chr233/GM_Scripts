// ==UserScript==
// @name:zh-CN      我需要更多展柜
// @name            Showcase_Tools
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
// @version         1.4
// @description     一键替换成指定展柜
// @description:zh-CN  一键替换成指定展柜
// @author          Chr_
// @include        /^https:\/\/steamcommunity\.com\/id\/[^/]+\/edit\/?/
// @include        /^https:\/\/steamcommunity\.com\/profiles\/\d+\/edit\/?/
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// ==/UserScript==

// 初始化
(() => {
  "use strict";

  console.log("本脚本已经失效, 请删除 【Showcase_Tools】")

  // let first = true;

  // function getAvilebleShowcases() {
  //   const select = document.querySelector("select[name='profile_showcase[]']");
  //   const options = select.querySelectorAll("option");
  //   const pointShowcases = [];

  //   for (let opt of options) {
  //     if (!opt.disabled && !opt.selected) {
  //       const purchaseId = opt.getAttribute("data-purchaseid");
  //       if (parseInt(purchaseId) > 0) {
  //         pointShowcases.push(purchaseId);
  //       }
  //     }
  //   }

  //   console.log(pointShowcases.length);

  //   return pointShowcases;
  // }

  // function addReplaceButton() {
  //   const bars = document.querySelectorAll("div.profile_showcase_selection_options_ctn");
  //   for (let bar of bars) {
  //     const select = bar.querySelector("select");
  //     const btn = document.createElement("button");
  //     const slot = select.getAttribute("data-slot");
  //     btn.className = "st_btn";
  //     btn.textContent = "替换成指定展柜";
  //     btn.addEventListener("click", () => { doReplace(slot); });
  //     bar.appendChild(btn);
  //   }
  // }

  // function doReplace(slot) {
  //   if (first) {
  //     first = false;
  //     ShowAlertDialog("提示", "部分展柜保存异常，可能与Steam有关");
  //   }

  //   const avilableIds = getAvilebleShowcases();

  //   if (avilableIds.length === 0) {
  //     ShowAlertDialog("可用点数展柜不足");
  //     return;
  //   }

  //   const div = document.createElement("div");
  //   const select = document.createElement("select");
  //   Object.entries({
  //     "Steam 年度回顾": 24,
  //     "完满主义者展柜": 23,
  //     "精选艺术作品展柜": 22,
  //     "奖励展柜": 21,
  //     "特卖星人统计数据": 20,
  //     "成就展柜": 17,
  //     "我的指南": 16,
  //     "收藏的指南": 15,
  //     "视频展柜": 14,
  //     "艺术作品展柜": 13,
  //     "我的创意工坊展柜": 12,
  //     "创意工坊展柜": 11,
  //     "评测展柜": 10,
  //     "最喜爱的组": 9,
  //     "自定义信息框": 8,
  //     "截图展柜": 7,
  //     "最喜爱的游戏": 6,
  //     "徽章收藏家": 5,
  //     "打算交易的物品": 4,
  //     "物品展柜": 3,
  //     "游戏收藏家": 2,
  //     "最稀有成就展柜": 1
  //   }).reverse().map(([k, v]) => {
  //     const option = document.createElement("option");
  //     option.value = v;
  //     option.textContent = k;
  //     option.title = k;
  //     select.appendChild(option);
  //   });
  //   div.appendChild(select);

  //   const dialog = ShowDialog("要替换成何种展柜?", div);

  //   const button = document.createElement("button");
  //   button.textContent = "应用 (保存后刷新页面生效)";
  //   button.addEventListener("click", () => {
  //     const pid = avilableIds[0];
  //     const rs = document.getElementById(`showcase_${slot}_select`);
  //     rs.value = select.value;

  //     const allOpts = document.querySelectorAll(`option[data-purchaseid='${pid}']`);
  //     for (let opt of allOpts) {
  //       opt.textContent = "替换展柜保存刷新后生效";
  //       opt.disabled = true;
  //     }

  //     const op = rs.querySelector(`option[data-purchaseid='${pid}']`);
  //     op.value = select.value;
  //     op.selected = true;
  //     op.disabled = false;

  //     document.getElementById(`showcase_${slot}_purchaseid`).value = pid;
  //     console.log(pid, select.value);

  //     dialog.Dismiss();
  //   });
  //   div.appendChild(button);

  // }

  // addReplaceButton();

})();

