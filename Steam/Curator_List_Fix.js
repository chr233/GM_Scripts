// ==UserScript==
// @name:zh-CN      鉴赏家列表修复
// @name            Curator_List_Fix
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
// @version         1.1
// @description     修复列表显示
// @description:zh-CN  修复列表显示
// @author          Chr_
// @include         https://store.steampowered.com/curator/*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_addStyle
// @grant           GM_setClipboard
// ==/UserScript==

// 初始化
(() => {
  "use strict";

  const eleContainer = document.getElementById("subpage_container");
  if (eleContainer) {
    const observer = new MutationObserver(onPageLoad);
    observer.observe(eleContainer, { childList: true, subtree: true });
  }

  let lastPathname = "";

  function onPageLoad() {
    if (lastPathname == location.pathname) {
      return;
    }
    lastPathname = location.pathname;

    if (location.pathname.includes("admin/lists_edit")) {
      injectListsEdit();
    }
  }

  onPageLoad();

  function injectListsEdit() {
    const [_, curator] = lastPathname.match(
      /\/curator\/([^\/]+)\/admin\/lists_edit/
    ) ?? [null, null];

    if (!curator) {
      return;
    }

    const eleOnload = document.querySelector("#subpage_container>div[onload]");
    const loadScript = eleOnload.getAttribute("onload");

    const matchValue = loadScript.match(
      /ListEdit_Onload\("(\d+)",([\d\D]+) \)/
    );

    const listid = matchValue[1];
    const listDetails = JSON.parse(matchValue[2]);

    console.log(listid);
    console.log(listDetails);

    let result = { recommendations: [], total_count: 0, start: 0, success: 1 };

    const eleTitleFrame = eleOnload.querySelector(
      "#curator_createlist_app_count_container"
    );

    const eleTips = document.getElementById("curator_createlist_app_count");

    let added = false;

    const btnLoad = genBtn("加载App列表数据", "clf_btn", async () => {
      btnLoad.disabled = true;
      result = await getFullAppsList(curator, eleTips);
      ListEdit_Onload(listid, listDetails);
      eleTips.textContent += `, 您的列表中有 ${g_rgAppsCurated.length} 个应用可用。`;
      btnLoad.disabled = false;

      if (!added) {
        added = true;
        const btnDump = genBtn("复制评测列表", "clf_btn", () => {});
        eleTitleFrame.appendChild(btnDump);
      }
    });
    eleTitleFrame.appendChild(btnLoad);

    LoadCuratorAssociatedApps = (fnOnComplete) => {
      console.log("hook");

      g_rgAppsCurated = result.recommendations;

      document.getElementById(
        "curator_createlist_app_count_throbber"
      ).style.display = "none";
      eleTips.textContent = "完整列表等待加载";

      if (fnOnComplete) {
        document.getElementById("apps_container").innerHTML = "";
        fnOnComplete();
      }
    };
  }

  function genBtn(text, cls, foo) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = cls;
    btn.addEventListener("click", foo);
    return btn;
  }
  function genA(url) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    return a;
  }
  function genDiv(cls) {
    const div = document.createElement("div");
    div.className = cls;
    return div;
  }
  function genSpan(name) {
    const span = document.createElement("span");
    span.textContent = name;
    return span;
  }
  function genTextarea(cls, placeholder) {
    const textarea = document.createElement("textarea");
    textarea.className = cls;
    textarea.placeholder = "一行一个 AppId";
    return textarea;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function getFullAppsList(curator, eleBtn) {
    // 分页数量
    const pageSize = 100;

    eleBtn.textContent = "正在加载第一页数据";

    const firstPageResponse = await getRecommendations(curator, 0, pageSize);
    if (!firstPageResponse) {
      return null;
    }

    const { total_count, recommendations } = firstPageResponse;
    const fullList = [...recommendations];

    if (total_count > pageSize) {
      // 并发请求的数量
      const concurrency = 3;

      const tasks = [];

      for (let i = pageSize; i < total_count; i += pageSize) {
        tasks.push([curator, i, pageSize]);
      }

      const totalPages = tasks.length;

      while (tasks.length > 0) {
        const subTasks = [];

        for (let i = 0; i < concurrency; i++) {
          const task = tasks.shift();
          if (task) {
            const [a, b, c] = task;
            subTasks.push(getRecommendations(a, b, c));
          } else {
            break;
          }
        }

        if (subTasks.length > 0) {
          eleBtn.textContent = `正在加载第 ${
            totalPages - tasks.length
          } / ${totalPages} 页数据`;

          const results = await Promise.all(subTasks);

          await delay(500);

          results.forEach((result) => {
            if (result && result.recommendations) {
              fullList.push(...result.recommendations);
            }
          });
        }

        eleBtn.textContent = "加载完成";
      }
    }

    const result = {
      recommendations: fullList,
      total_count,
      start: 0,
      success: 1,
    };

    console.log(result);
    return result;
  }

  function getRecommendations(curator, start, count) {
    return new Promise((resolve, reject) => {
      const url = `https://store.steampowered.com/curator/${curator}/admin/ajaxgetrecommendations/?query&start=${start}&count=${count}`;
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const { recommendations } = data;

          if (recommendations) {
            for (let item of recommendations) {
              item.unListed = item.app_name === "Uninitialized";
              delete item.recommendation;
              item.curated = true;
            }
          }

          data.success = 1;
          data.start = parseInt(data.start);

          console.log("page", start, count);
          console.log(data);
          resolve(data);
        })
        .catch((error) => {
          console.error(error);
          reject(null);
        });
    });
  }
})();

GM_addStyle(`
.clf_btn {
  padding: 2px 10px;
  margin: 5px;
}
`);
