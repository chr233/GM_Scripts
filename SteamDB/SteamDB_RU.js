// ==UserScript==
// @name                SteamDB_RU
// @namespace           https://blog.chrxw.com
// @supportURL          https://blog.chrxw.com/scripts.html
// @contributionURL     https://afdian.com/@chr233
// @version             1.38
// @description         SteamDB Translation Plugin
// @author              Chr_
// @match               https://steamdb.info/*
// @license             AGPL-3.0
// @icon                https://blog.chrxw.com/favicon.ico
// @resource            data https://raw.chrxw.com/GM_Scripts/master/SteamDB/SteamDB_RU.json
// @grant               GM_addStyle
// @grant               GM_getResourceText
// @grant               GM_registerMenuCommand
// ==/UserScript==


(function () {
  "use strict";

  const ENABLE = "ENABLE";
  const DISABLE = "DISABLE";

  const DEBUG = window.localStorage["dbg_mode"] === ENABLE;
  const OUTPUT = window.localStorage["out_word"] === ENABLE;

  GM_registerMenuCommand(`Debug Translation: 【${DEBUG ? ENABLE : DISABLE}】`, () => {
    window.localStorage["dbg_mode"] = DEBUG ? DISABLE : ENABLE;
    window.location.reload();
  });

  GM_registerMenuCommand(`Log unmatched texts in console: 【${OUTPUT ? ENABLE : DISABLE}】`, () => {
    window.localStorage["out_word"] = OUTPUT ? DISABLE : ENABLE;
    window.location.reload();
  });

  document.querySelector("html").setAttribute("lang", "zh-CN");

  let Locales;

  if (DEBUG) {
    const genBtn = (text, fun, cls = null) => {
      const btn = document.createElement("button");
      btn.textContent = text;
      btn.addEventListener("click", fun);
      if (cls !== null) {
        btn.className = cls;
      }
      return btn;
    };

    const template = JSON.stringify({
      DOC: {
        "Update time": Date().toLocaleString(),
        "Contributions list": ["debug mode"],
      },
      STATIC: {},
      INPUT: {},
      LABEL: {},
      DYNAMIC: {},
    }, null, 2);
    const box = document.createElement("div");
    box.className = "sdc";
    const text = document.createElement("textarea");
    box.appendChild(text);
    const action = document.createElement("div");
    action.className = "sdc-links";
    box.appendChild(action);
    const btnSave = genBtn("💾 Save and apply", () => {
      const raw = text.value.trim();
      if (!raw) {
        alert("Translation text cannot be empty!!!");
      } else {
        try {
          JSON.parse(raw);
          window.localStorage["sdb_lang"] = raw;
          window.location.reload();
        } catch (e) {
          alert("Translation text is not valid JSON format!!!");
        }
      }
    });
    action.appendChild(btnSave);
    const btnReset = genBtn("🗑️ Clear text", () => {
      window.localStorage["sdb_lang"] = template;
      window.location.reload();
    });
    action.appendChild(btnReset);
    const btnOnline = genBtn("📄 Current online text", () => {
      if (confirm("Replacing with the online version will lose any current changes, are you sure you want to continue?")) {
        text.value = GM_getResourceText("data");
      }
    });
    action.appendChild(btnOnline);
    const about = document.createElement('a');
    about.href = "https://blog.chrxw.com";
    about.innerText = "🔗 By Chr_ © 2022";
    action.appendChild(about);

    const father = document.getElementById("main");
    father.insertBefore(box, father.firstChild);
    const customLang = window.localStorage["sdb_lang"] ?? template;
    text.value = customLang;
    Locales = JSON.parse(customLang);
  } else {
    Locales = JSON.parse(GM_getResourceText("data"));
  }

  //计时
  const Start = new Date().getTime();

  {//静态元素
    for (const [css, dic] of Object.entries(Locales.STATIC)) {
      if (OUTPUT) { console.log(`〖${css}〗`); }
      const elements = document.querySelectorAll(css);
      if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          if (element.childElementCount === 0) {//节点内部无其他元素
            const raw = element.innerText?.trim();
            if (!raw || raw.length <= 2) { continue; }
            const txt = dic[raw];
            if (txt) {
              element.innerText = txt;
            } else if (OUTPUT) {
              console.log(`"${raw}": "",`);
            }
          } else {//节点内部有其他元素
            const nodes = element.childNodes;
            for (let j = 0; j < nodes.length; j++) {
              const node = nodes[j];
              if (node.nodeType === Node.TEXT_NODE) {
                const raw = node.textContent?.trim();
                if (!raw || raw.length <= 2) { continue; }
                const txt = dic[raw];
                if (txt) {
                  node.textContent = txt;
                } else if (OUTPUT) {
                  console.log(`"${raw}": "",`);
                }
              }
            }
          }
        }
      } else {
        if (OUTPUT) { console.warn(`CSS selector did not match any elements: ${css}`); }
      }
    }
  }

  {//输入框
    const inputs = Locales.INPUT;
    if (OUTPUT) { console.log("〖Input fields〗"); }
    const elements = document.querySelectorAll("input");
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const raw = element.placeholder;
      if (!raw) { continue; }
      const txt = inputs[raw];
      if (txt) {
        element.placeholder = txt;
      } else if (OUTPUT) {
        console.log(`"${raw}": "",`);
      }
    }
  }

  {//悬浮提示
    const labels = Locales.LABEL;
    if (OUTPUT) { console.log("〖Input fields〗"); }
    const elements = document.querySelectorAll("*[aria-label]");
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const raw = element.getAttribute("aria-label");
      if (!raw) { continue; }
      const txt = labels[raw];
      if (txt) {
        element.setAttribute("aria-label", txt);
      } else if (OUTPUT) {
        console.log(`"${raw}": "",`);
      }
    }
  }

  const { script: { version } } = GM_info;
  const { DOC: { "Update time": update, "Contributions list": contribution } } = Locales;

  const End = new Date().getTime();

  // 统计耗时
  // 统计耗时
  console.log("Execution time", `${End - Start} ms`);
  console.log("=================================");
  console.log(`Plugin version: ${version}`);
  console.log(`Update time: ${update}`);
  console.log(`Contributions list: ${contribution.join(", ")}`);
  console.log("=================================");

  // 添加按钮
  setTimeout(() => {
    const headerUl = document.querySelector(".header-menu-container>div>ul:nth-child(1)");
    const footerUl = document.querySelector(".footer-container>div>ul:nth-child(1)");
    const scriptLink = document.createElement("li");
    scriptLink.innerHTML = `<a href="https://blog.chrxw.com" target="_blank">SteamDB 汉化 V${version}</a>`;
    headerUl?.appendChild(scriptLink);
    footerUl?.appendChild(scriptLink.cloneNode(true));
  }, 500);

  // 添加样式
  GM_addStyle(`
  .tabnav-tabs > a {
    min-width: 80px;
  }
  .sdc {
    display: flex;
  }
  .sdc > textarea {
    width: 100%;
    height: 200px;
    min-height: 200px;
    resize: vertical;
  }
  .sdc > div.sdc-links {
    width: 150px;
    margin: 5px;
  }
  .sdc > div.sdc-links > * {
    width: 100%;
    margin-bottom: 10px;
    background-color: #213145;
    color: white;
    font-size: 12px;
    border-radius: 0px;
    display: inline-block;
    height: 30px;
  }
  .sdc > div.sdc-links > a:last-child {
    width: 100%;
    margin-top: 30px;
    margin-bottom: 0px;
    color: #67c1f5;
    background-color: #273b4b;
  }
`);
})(); 