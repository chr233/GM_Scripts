// ==UserScript==
// @name                SteamDB_CN
// @name:zh-CN          SteamDB汉化
// @namespace           https://blog.chrxw.com
// @version             1.7
// @description         SteamDB汉化插件
// @description:zh-cn   SteamDB汉化插件
// @author              Chr_
// @match               https://steamdb.info/*
// @supportURL          https://steamcn.com/t339531-1-1
// @license             AGPL-3.0
// @icon                https://blog.chrxw.com/favicon.ico
// @resource            data https://gitee.com/chr_a1/gm_scripts/raw/master/SteamDB/lang_zh_CN.json
// @grant               GM_getResourceText
// @grant               GM_registerMenuCommand
// ==/UserScript==


(function () {
  'use strict';
  const DEBUG = window.localStorage['dbg_mode'] == '开';
  const OUTPUT = window.localStorage['out_word'] == '开';

  GM_registerMenuCommand(`调试汉化文本：【${DEBUG ? '开' : '关'}】`, () => {
    window.localStorage['dbg_mode'] = DEBUG ? '关' : '开';
    window.location.reload();
  });

  GM_registerMenuCommand(`在控制台输出未匹配文本：【${OUTPUT ? '开' : '关'}】`, () => {
    window.localStorage['out_word'] = OUTPUT ? '关' : '开';
    window.location.reload();
  });

  let Locales;

  if (DEBUG) {
    const box = document.createElement('div');
    const text = document.createElement('textarea');
    text.style.cssText = 'width:90%;height:250px;resize:vertical;';
    box.appendChild(text);
    const btnSave = document.createElement('button');
    btnSave.innerText = '保存并刷新';
    btnSave.addEventListener('click', () => {
      const raw = text.value.trim();
      if (!raw) {
        alert('翻译文本不能为空!!!');
      } else {
        try {
          JSON.parse(raw);
          window.localStorage['sdb_lang'] = raw;
          window.location.reload();
        } catch (e) {
          alert('翻译文本不是有效的JSON格式!!!');
        }
      }
    });
    btnSave.style.cssText = 'width:10%;height:50px;';
    box.appendChild(btnSave);
    const father = document.getElementById('main');
    father.insertBefore(box, father.firstChild);
    const template = '{"DOC":{"更新时间":"调试模式","贡献名单":["调试模式"]},\n"STATIC":\n{\n\n},\n"INPUT":\n{\n\n},\n"DYNAMIC":\n{\n\n}\n}';
    const customLang = window.localStorage['sdb_lang'] ?? template;
    text.value = customLang;
    Locales = JSON.parse(customLang);
  } else {
    Locales = JSON.parse(GM_getResourceText("data"));
  }

  //计时
  var Start = new Date().getTime();

  {//静态元素
    for (const [css, dic] of Object.entries(Locales.STATIC)) {
      if (OUTPUT) {
        console.log(`〖${css}〗`);
      }
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
            } else if (OUTPUT) {
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
                } else if (OUTPUT) {
                  console.log(`"${raw}": "",`);
                }
              }
            }
          }
        }
      }
    }
  }

  {//输入框
    const inputs = Object.entries(Locales.INPUT);
    if (OUTPUT) {
      console.log('〖输入框〗');
    }
    const elements = document.querySelectorAll("input");
    if (elements.length > 0) {
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
  }



  const { script: { version } } = GM_info;
  const { DOC: { "更新时间": update, "贡献名单": contribution } } = Locales;

  // call your function
  var End = new Date().getTime();
  console.log('执行耗时', `${End - Start} ms`);
  console.log('=================================')
  console.log(`插件版本: ${version}`);
  console.log(`更新时间: ${update}`);
  console.log(`贡献名单: ${contribution.join(', ')}`);
  // // 创建一个观察器实例并传入回调函数
  // const observer = new MutationObserver((mutationsList, observer) => {
  //     // Use traditional 'for loops' for IE 11
  //     for (let mutation of mutationsList) {
  //         console.log(mutation);

  //     }

  // });

  // // 以上述配置开始观察目标节点
  // observer.observe(document.body, { childList: true, subtree: true });

  // // 之后，可停止观察
  // observer.disconnect();

})();