// ==UserScript==
// @name:zh-CN      Hikari_Field入库检测
// @name            Hikari_Field_Helper
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         2.18
// @description     Hikari_Field入库游戏检测
// @description:zh-CN  Hikari_Field入库游戏检测
// @author          Chr_
// @include         https://keylol.com/*
// @include         https://store.hikarifield.co.jp/libraries
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @resource        data https://raw.chrxw.com/GM_Scripts/master/Keylol/Data/Hikari_Field_Helper.json
// @grant           GM_getResourceText
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_addStyle
// ==/UserScript==


(() => {
  "use strict";

  const HFSHOP = "https://store.hikarifield.co.jp/shop/";
  const HFLIBARY = "https://store.hikarifield.co.jp/libraries";

  const { INFO, DESC } = JSON.parse(GM_getResourceText("data"));
  const host = window.location.host;

  if (host === "store.hikarifield.co.jp") {
    //更新库存
    const myGames = document.querySelectorAll(".game-cover>a");
    const ownedGames = [625760]; //魔卡魅恋(免费)
    for (const ele of myGames) {
      const key = ele.href?.replace(HFSHOP, "");
      if (key) {
        let [gameName, appID, _, __] = INFO[key] ?? [null, null, null];
        if (appID !== null) {
          ownedGames.push(appID);
          console.log(`已拥有 ${gameName} ${appID}`);
        }
      } else {
        console.error(`${ele.href} 无效`);
      }
    }
    //储存列表
    GM_setValue("ownedGames", ownedGames);
    GM_setValue("refreshTime", new Date().toISOString());
    swal({
      position: "top-end",
      text: "导入游戏列表成功",
      icon: "success",
      button: false,
      timer: 1200
    });

  } else if (host.endsWith("keylol.com")) {
    //其乐
    if (document.title.search("Keylol") === -1) { return; } //跳过iframe
    const ownedGames = new Set(GM_getValue("ownedGames") ?? []);
    const refreshTime = GM_getValue("refreshTime") ?? null;

    if (ownedGames.size === 0) {
      if (confirm("是否立即导入游戏列表?")) {
        window.location.href = HFLIBARY;
      } else {
        showError("【可以在悬浮窗口中进行同步】");
        GM_setValue("ownedGames", [0]);
      }
    }

    setTimeout(() => {
      const steamLinks = document.querySelectorAll("a[href^='https://store.steampowered.com/'],a[href^='https://steamdb.info/app/']");
      const HFLinks = document.querySelectorAll("a[href^='https://store.hikarifield.co.jp/shop/'],a[href^='https://shop.hikarifield.co.jp/shop/']");
      let flag = HFLinks.length > 0;
      const grubAppid = RegExp(/app\/(\d+)\/?/);
      const grubHFKey = RegExp(/shop\/(\S+)\/?/);
      for (const ele of steamLinks) {
        const href = ele.href;
        if (href) {
          const appID = parseInt(grubAppid.exec(href)?.[1] ?? 0);
          if (appID > 0) {
            if (ownedGames.has(appID)) {
              ele.classList.add("steam-info-link");
              ele.classList.add("steam-info-own");
              flag = true;
            }
          }
        }
      }
      if (!flag) { return; } //未匹配到游戏,结束运行
      for (const ele of HFLinks) {
        const href = ele.href;
        if (href) {
          const key = grubHFKey.exec(href)?.[1];
          if (key) {
            let [_, appID, __, ___] = INFO[key] ?? [null, null, null, null];
            if (appID !== null) {
              if (ownedGames.has(appID)) {
                ele.classList.add("steam-info-link");
                ele.classList.add("steam-info-own");
              }
              ele.setAttribute("data-hf", key);
              ele.addEventListener("mouseenter", showDiag);
              ele.addEventListener("mouseleave", hideDiag);
            }
          } else {
            console.log(ele);
          }
        }
      }
    }, 1000);

    const diagObjs = {}; // 小部件DOM对象
    let isShow = false;  // 悬浮窗是否显示
    let timer = -1;      // 隐藏计时器

    //创建弹窗小部件
    function initDiag() {
      const newDiv = (cls) => { const d = document.createElement("div"); if (cls) { d.className = cls; } return d; };

      const hfBox = newDiv("hf-box");

      let lastRefresh;
      if (refreshTime !== null) {
        try {
          const t = new Date(refreshTime);
          lastRefresh = `账号同步于 ${t.toLocaleString()} 点击刷新`;
        } catch (e) {
          console.error(e);
          lastRefresh = "读取同步时间出错, 点击刷新";
        }
      } else {
        lastRefresh = "账号未同步, 点击刷新";
      }

      hfBox.style.display = "none";

      hfBox.innerHTML = `
      <div class="hf-head">
        <span title="">占位</span>
      </div>
      <div class="hf-body">
        <img src="https://cdn.cloudflare.steamstatic.com/steam/apps/1662840/header.jpg">
      </div>
      <div class="hf-foot">
        <div class="hf-describe">
          <span title="">...</span>
        </div>
        <div class="hf-line"></div>
        <div class="hf-detail">
          <div class="hf-line"></div>
          <div><a href="${HFLIBARY}" target="_blank">${lastRefresh}</a></div>
          <div class="hf-line"></div>
          <p class="hf-hf"><b>HF商店:</b><span class="hf-unknown">占位</span><a href="#" target="_blank" class="hf-link">前往商店</a></p>
          <div class="hf-line"></div>
          <p class="hf-steam"><b>Steam: </b><span class="hf-unknown">占位</span> <a href="#" target="_blank" class="hf-link steam-info-loaded">前往商店</a> (<a href="#" target="_blank">SteamDB</a>)</p></div>
          <div class="hf-line"></div>
        </div>
      </div>`

      document.body.appendChild(hfBox);

      const eleTitle = hfBox.querySelector("div.hf-head>span");
      const eleImg = hfBox.querySelector("div.hf-body>img");
      const eleDesc = hfBox.querySelector("div.hf-describe>span");
      const eleHfState = hfBox.querySelector("p.hf-hf>span");
      const eleHfLink = hfBox.querySelector("p.hf-hf>a");
      const eleSteamState = hfBox.querySelector("p.hf-steam>span");
      const eleSteamLink = hfBox.querySelector("p.hf-steam>a:first-of-type");
      const eleSteamDBLink = hfBox.querySelector("p.hf-steam>a:last-of-type");

      hfBox.addEventListener("mouseenter", diagMoveIn);
      hfBox.addEventListener("mouseleave", hideDiag);

      Object.assign(diagObjs, {
        hfBox, eleTitle, eleImg, eleDesc, eleHfState,
        eleHfLink, eleSteamState, eleSteamLink, eleSteamDBLink
      });
    }

    initDiag();

    const { script: { version } } = GM_info;
    const Tail = ` - 『Hikari Field Helper v${version} by Chr_』`;

    //更新小部件显示
    function showDiag(event) {
      isShow = true;
      clearTmout();

      const ele = event.target;
      const key = ele.getAttribute("data-hf");

      const { hfBox, eleTitle, eleImg, eleDesc, eleHfState, eleHfLink, eleSteamState, eleSteamLink, eleSteamDBLink } = diagObjs;

      const [gameName, appID, steamState, hfState] = INFO[key] ?? [null, null, null, null];
      const describe = DESC[key] ?? "";

      if (!gameName) { return; }

      eleTitle.title = gameName + Tail;
      eleTitle.textContent = gameName;
      eleImg.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appID}/header.jpg`;

      eleDesc.textContent = describe.substr(0, 72) + "...";
      eleDesc.title = describe;

      switch (hfState) {
        case -1:
          eleHfState.textContent = "已下架";
          eleHfState.className = "hf-unavailable";
          break;
        case 1:
          eleHfState.textContent = "可购买";
          eleHfState.className = "hf-available";
          break;
        default:
          eleHfState.textContent = "未发售";
          eleHfState.className = "hf-unknown";
          break;
      }
      eleHfLink.href = HFSHOP + key;

      switch (steamState) {
        case -1:
          eleSteamState.textContent = "已下架";
          eleSteamState.className = "hf-unavailable";
          eleSteamLink.classList.add("hf-disabled");
          break;
        case 1:
          eleSteamState.textContent = "可购买";
          eleSteamState.className = "hf-available";
          eleSteamLink.classList.remove("hf-disabled");
          break;
        default:
          eleSteamState.textContent = "未发售";
          eleSteamState.className = "hf-unknown";
          eleSteamLink.classList.remove("hf-disabled");
          break;
      }
      eleSteamLink.href = `https://store.steampowered.com/app/${appID}/`;
      eleSteamDBLink.href = `https://steamdb.info/app/${appID}/`;

      const { top, right } = ele.getBoundingClientRect();

      const boxHeight = 303;
      const boxWidth = 300;

      const boxTop = Math.min(top, document.documentElement.clientHeight - boxHeight) + window.scrollY;
      const boxLeft = Math.min(right, document.documentElement.clientWidth - boxWidth) + window.scrollX;

      hfBox.style.left = `${boxLeft}px`;
      hfBox.style.top = `${boxTop}px`;
      hfBox.style.opacity = 1;
      hfBox.style.display = "";
    }
    //清除计时器
    function clearTmout() {
      if (timer !== -1) {
        clearTimeout(timer);
        timer = -1;
      }
    }
    //对话框鼠标移入
    function diagMoveIn(event) {
      clearTmout();
    }
    //隐藏小部件
    function hideDiag(event) {
      clearTmout();
      const { hfBox } = diagObjs;
      if (isShow) {
        timer = setTimeout(() => {
          isShow = false;
          timer = -1;
          hfBox.style.opacity = 0;
          setTimeout(() => {
            hfBox.style.cssText = "display:none; opacity: 0;";
          }, 200);
        }, 900);
      }
    }
  }

})();

GM_addStyle(`.hf-line {
  margin-top: 0.5em;
}
.hf-available {
  color: #6c3;
  padding: 0 0.3em;
}
.hf-unavailable {
  color: #e60;
  padding: 0 0.3em;
}
.hf-unknown {
  color: #ccc;
  padding: 0 0.3em;
}
.hf-available::before {
  content: "☑";
  padding-right: 0.3em;
}
.hf-unavailable::before {
  content: "☒";
  padding-right: 0.3em;
}
.hf-unknown::before {
  content: "☐";
  padding-right: 0.3em;
}
.hf-disabled {
  pointer-events: none;
  cursor: default;
  text-decoration: line-through !important;
}
.hf-detail > div {
  text-align: center;
}
.hf-box {
  width: 300px;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 100;
  background-color: #343a40;
  color: #ccc;
  border-radius: 5px;
  transition: all 0.2s;
}
.hf-box * {
  max-width: 100%;
}
.hf-head {
  overflow: hidden;
  white-space: nowrap;
  margin: 4px 0;
}
.hf-head > span {
  font-size: 12px;
  font-weight: bold;
  padding: 5px 16px;
}
.hf-head > a {
  position: absolute;
  right: 5px;
  cursor: pointer;
}
.hf-body {
  height: 140px;
}
.hf-foot {
  margin: 5px;
}
.hf-foot b {
  color: #8a959c;
  font-weight: normal;
}
.hf-foot a {
  color: #fff;
  text-decoration: none;
}

`);
