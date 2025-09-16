// ==UserScript==
// @name:zh-CN      复制AppId
// @name            CopyAppId
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
// @version         1.0
// @description     复制页面中的所有AppId
// @description:zh-CN  复制页面中的所有AppId
// @author          Chr_
// @include         https://keylol.com/*
// @include         https://store.steampowered.com/*
// @include         https://steamcommunity.com/*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @connect         1tmd.com
// @grant           GM_setClipboard
// @grant           GM_xmlhttpRequest
// ==/UserScript==

(async () => {
  "use strict";

  setTimeout(async () => {
    const appIds = getAppIds();
    if (appIds.length > 0) {
      console.log(appIds);

      const groups = chunkArray(appIds, 60);
      for (const group of groups) {
        await queryGame(JSON.stringify(group));
      }
    }
  }, 2000);

  function getAppIds() {
    const links = document.querySelectorAll(
      "a[href^='https://store.steampowered.com/app/']"
    );
    const regex = /app\/(\d+)/;
    const appIds = new Set();

    for (let link of links) {
      const href = link.getAttribute("href");
      const match = href.match(regex);
      if (match) {
        appIds.add(parseInt(match[1]));
      }
    }

    return [...appIds];
  }

  // 按指定大小分组数组
  function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  //获取游戏名
  function queryGame(appIds) {
    return new Promise((resolve, reject) => {
      $http
        .post(
          "https://api.1tmd.com/GameInfo/GetGameFulls?chinese=true",
          appIds
        )
        .then((response) => {
          console.log(response);
          resolve(true);
        })
        .catch((reason) => {
          console.log(reason);
          resolve(false);
        });
    });
  }
})();

//-----------------------------------
class Request {
  "use strict";
  constructor(timeout = 3000) {
    this.timeout = timeout;
  }
  get(url, opt = {}) {
    return this.#baseRequest(url, "GET", opt, "json");
  }
  post(url, data, opt = {}) {
    opt.data = data;
    opt.headers = {
      "Content-Type": "application/json",
    };
    return this.#baseRequest(url, "POST", opt, "json");
  }
  delete(url, opt = {}) {
    return this.#baseRequest(url, "DELETE", opt, "json");
  }
  #baseRequest(url, method = "GET", opt = {}, responseType = "json") {
    Object.assign(opt, {
      url,
      method,
      responseType,
      timeout: this.timeout,
    });
    return new Promise((resolve, reject) => {
      opt.ontimeout = opt.onerror = reject;
      opt.onload = ({
        readyState,
        status,
        response,
        responseXML,
        responseText,
      }) => {
        if (readyState === 4 && status === 200) {
          if (responseType == "json") {
            resolve(response);
          } else if (responseType == "text") {
            resolve(responseText);
          } else {
            resolve(responseXML);
          }
        } else {
          console.error("网络错误");
          console.log(readyState);
          console.log(status);
          console.log(response);
          reject("解析出错");
        }
      };
      GM_xmlhttpRequest(opt);
    });
  }
}

const $http = new Request();
