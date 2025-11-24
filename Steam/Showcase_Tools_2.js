// ==UserScript==
// @name:zh-CN      我需要更多展柜2
// @name            Showcase_Tools_2
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
// @version         1.5
// @description     从点数商店购买第三个展柜
// @description:zh-CN  从点数商店购买第三个展柜
// @author          Chr_
// @include         https://store.steampowered.com/points/shop/*
// @license         AGPL-3.0
// @connect         api.steampowered.com
// @icon            https://blog.chrxw.com/favicon.ico
// ==/UserScript==

// 初始化
(() => {
  "use strict";

  const t = setInterval(addPanel, 1000);

  function addPanel() {
    const container = document.querySelector("#points_shop_root>div>div div:not([style]) div[class='Panel Focusable']");

    if (!container) {
      console.error("找不到元素");
      return;
    }
    else {
      clearInterval(t);
    }

    const token = JSON.parse(
      document
        .querySelector("#application_config")
        ?.getAttribute("data-loyaltystore")
    )?.webapi_token;

    if (!token) {
      console.error("获取token失败");
      return;
    }

    const btn = document.createElement("button");
    btn.textContent = "购买更多展柜";
    btn.addEventListener("click", () => showPanel(token));
    btn.title = btn.textContent;
    btn.style = "position: absolute;right: 50%;top: 100px;padding: 5px;z-index: 9999;";
    container.appendChild(btn);
  }

  function showPanel(token) {
    const showCases = {
      Steam年度回顾: 24,
      完满主义者展柜: 23,
      精选艺术作品展柜: 22,
      // 奖励展柜: 21,
      // 特卖星人统计数据: 20,
      成就展柜: 17,
      我的指南: 16,
      收藏的指南: 15,
      视频展柜: 14,
      艺术作品展柜: 13,
      我的创意工坊展柜: 12,
      创意工坊展柜: 11,
      评测展柜: 10,
      最喜爱的组: 9,
      自定义信息框: 8,
      截图展柜: 7,
      最喜爱的游戏: 6,
      徽章收藏家: 5,
      打算交易的物品: 4,
      物品展柜: 3,
      游戏收藏家: 2,
      // 最稀有成就展柜: 1,
    };

    const div = document.createElement("div");

    const select = document.createElement("select");
    select.style = "padding: 5px;margin-right: 10px;";
    for (let name in showCases) {
      const option = document.createElement("option");
      option.value = showCases[name];
      option.textContent = name;
      option.title = name;
      select.appendChild(option);
    }

    div.appendChild(select);

    alert("脚本疑似失效, 可能不能够购买, 请删除 Showcase_Tools_2");

    const dialog = ShowDialog("要购买什么展柜?", div);

    const button = document.createElement("button");
    button.textContent = "买!!! (请确保点数充裕)";
    button.style = "padding: 3px;";
    button.addEventListener("click", async () => {
      await buyShowcases(token, select.value);

      ShowAlertDialog("提示", "购买操作完成, 是否购买成功请前往个人资料中查看。", "知道了");

      dialog.Dismiss();
    });
    div.appendChild(button);
  }


  // 购买展柜
  function buyShowcases(token, type = 1) {
    return new Promise((resolve, reject) => {
      fetch(
        `https://api.steampowered.com/ILoyaltyRewardsService/RedeemPointsForProfileCustomization/v1/?access_token=${token}&customization_type=${type}`,
        {
          method: "POST",
        }
      )
        .then((response) => {
          response.json().then((json) => {
            const { success } = json;
            resolve(success);
          });
        })
        .catch((err) => {
          console.error(err);
          reject(`购买展柜失败 ${err}`);
        });
    });
  }
})();
