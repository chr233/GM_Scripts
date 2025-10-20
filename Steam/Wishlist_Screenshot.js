// ==UserScript==
// @name:zh-CN      Steam 愿望单截图助手
// @name            Wishlist_Screenshot
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
// @version         1.0
// @description     一键生成愿望单截图
// @description:zh-CN  一键生成愿望单截图
// @author          Chr_
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @require         https://lib.baomitu.com/html2canvas/1.4.1/html2canvas.min.js
// @include         https://store.steampowered.com/app/*
// @grant           GM_setClipboard
// @grant           GM_addStyle
// ==/UserScript==

(() => {
  "use strict";
  // 初始化
  const GObjs = {};
  let GTimer = 0;

  (() => {
    addGUI();
  })();

  function addGUI() {
    const container = document.querySelector("div.apphub_OtherSiteInfo");
    const top = container.getBoundingClientRect().top + window.scrollY;

    const btn = document.createElement("a");
    btn.style.top = `${top}px`;
    btn.addEventListener("click", takePhoto);
    btn.className = "ws_take_photo btnv6_blue_hoverfade btn_medium";
    btn.textContent = "📷";

    document.body.appendChild(btn);
  }

  async function takePhoto() {
    const container = document.createElement("div");
    const span = document.createElement("span");
    span.textContent = "11111";
    container.appendChild(span);
    showDialog(container);
  }

  //显示提示框
  function showDialog(ele) {
    const genBtn = (text, onclick) => {
      const btn = document.createElement("button");
      btn.textContent = text;
      btn.className = "btn_medium fec_btn";
      if (onclick) {
        btn.addEventListener("click", onclick);
      }
      return btn;
    };
    const area = document.createElement("div");
    area.className = "fec_area";
    const tit = document.createElement("h2");
    tit.className = "fec_title";
    tit.innerText = "";

    const action = document.createElement("div");
    action.className = "fec_action";
    const btnAbort = genBtn("⛔停止运行", () => {
      if (isWorking) {
        isWorking = false;
        tit.innerText = "已停止";
      }
    });
    btnAbort.disabled = true;
    const btnClose = genBtn("❌关闭", null);
    const btnCopy = genBtn("📋复制", () => {
      GM_setClipboard(txt.value, "text");
      btnCopy.innerText = "✅已复制";
      setTimeout(() => {
        btnCopy.innerText = "📋复制";
      }, 1000);
    });
    action.appendChild(btnCopy);
    action.appendChild(btnAbort);
    action.appendChild(btnClose);
    area.appendChild(ele);
    area.appendChild(action);
    const diag = ShowDialog("", area, { bExplicitDismissalOnly: true });
    btnClose.addEventListener("click", () => {
      diag.Dismiss();
    });
    return [btnAbort];
  }
  //异步Sleep
  function aioSleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function genImage() {
    window.stop();
    show_flash("图片生成中...");
    const Start = new Date().getTime();
    const { divCnv } = GObjs;
    const steam = document.querySelector(".sr-user");
    const helps = document.querySelectorAll(
      "div[class='key-container wrapper']>div>p"
    );
    const btns = document.querySelectorAll("button.hb_sc");
    if (btns || btns.length > 0) {
      if (steam) {
        steam.style.display = "none";
      }
      if (helps) {
        for (const ele of helps) {
          ele.style.display = "none";
        }
      }
      divCnv.style.display = "";
      const keyArea = document.querySelector(
        "div[class='key-container wrapper']"
      );
      const canvas = await html2canvas(keyArea, {
        imageTimeout: 10,
        logging: false,
      });
      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");
      divCnv.innerHTML = "";
      divCnv.appendChild(img);
      if (steam) {
        steam.style.display = "";
      }
      if (helps) {
        for (const help of helps) {
          help.style.display = "";
        }
      }
      const End = new Date().getTime();
      show_flash(`图片生成完成, 右键图片复制, 耗时 ${End - Start} ms`);
    } else {
      show_flash("Key列表为空?\n或许是卡DOM了, 刷新一下即可。");
    }
  }

  function copyHTML() {
    const data = parseKeys();
    const tdCss = 'style="padding:5px 10px;border-top:1px solid;"';
    const list = [
      '<table style="border-collapse:collapse;margin-bottom:0.7em;">',
      "<tr><th>游戏名</th><th>Key</th></tr>",
    ];
    for (let [title, key] of data) {
      list.push(`<tr><td ${tdCss}>${title}</td><td ${tdCss}>${key}</td></tr>`);
    }
    list.push("</table>");
    setClipboard(list.join("\n"), "html");
    show_flash("复制成功");
  }
  function setClipboard(data, dataType = "text") {
    GM_setClipboard(data, dataType);
  }
})();

GM_addStyle(`
.ws_take_photo {
  position: absolute;
  padding: 8px;
  left: 50px;
}
`);
