// ==UserScript==
// @name:zh-CN      鉴赏家小工具-Dump
// @name            Curator_Tools_Dump
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
// @version         1.1
// @description     导入导出
// @description:zh-CN  导入导出
// @author          Chr_
// @include         https://store.steampowered.com/curator/*/admin/*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_addStyle
// @grant           GM_download
// ==/UserScript==

// 初始化
(() => {
  "use strict";

  const [_, curatorId] = location.pathname.match(
    /\/curator\/([^\/]+)\/admin/
  ) ?? [null, null];

  if (!curatorId) {
    console.log("提取 curator 失败");
    return;
  }

  const eleContainer = document.querySelector("div.admin_nav");
  if (eleContainer) {
    onPageLoad();
  }

  function onPageLoad() {
    let data = [];

    const btnLoad = genBtn("获取数据", "ctd_btn", () => {
      getFullAppsList(curatorId, btnLoad).then((result) => {
        btnLoad.style.display = 'none';
        data = result;

        console.log(JSON.stringify(data));

        const btnDump1 = genBtn("导出全部评测", "ctd_btn", () => {
          dumpData(data, "全部评测");
        });
        const btnDump2 = genBtn("导出异常评测", "ctd_btn", () => {
          const dump = data.filter(x => x.unListed);
          dumpData(dump, "异常评测");
        });
        // const btnDelete = genBtn("删除异常评测", "ct_btn", () => {
        //   getFullAppsList(curatorId, btnDelete)
        // });

        eleContainer.appendChild(btnDump1);
        eleContainer.appendChild(btnDump2);
        // eleContainer.appendChild(btnDelete);
      });
    })

    eleContainer.appendChild(btnLoad);
  }

  function genBtn(text, cls, foo) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = cls;
    btn.addEventListener("click", foo);
    return btn;
  }

  function showAlert(text, succ = true) {
    return ShowAlertDialog(`${succ ? "✅" : "❌"}`, text);
  }

  function dumpData(data, name) {
    const csv = convertToCsv(data);
    downloadCsv(csv, name);
  }

  function deleteUnlisted() {

  }

  function convertToCsv(arr) {
    if (!arr || arr.length === 0) return '';
    const header = ["AppId", "游戏名", "下架", "评测内容", "管理链接"].join(',');
    const escape = s => `"${String(s).replace(/"/g, '""').replace(/\n/g, '\\n')}"`;
    const rows = [];
    for (let { appid, app_name, unListed, blurb, edit_url } of arr) {
      const row = [appid, app_name, unListed, blurb, edit_url].map(escape);
      rows.push(row.join(','));
    }
    return header + '\n' + rows.join('\n');
  }

  function downloadCsv(csv, name) {
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    GM_download({
      url: url,
      name: `${name}.csv`
    });
  }

  // 批量爬取
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
          eleBtn.textContent = `正在加载第 ${totalPages - tasks.length
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

    return fullList;
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

          const result = [];

          if (recommendations) {

            const regex = /(?:《|<)(.*)(?:》|>)/;

            for (let item of recommendations) {
              const appid = item.appid;
              let app_name = item.app_name
              const unListed = item.app_name === "Uninitialized";
              const { blurb } = item.recommendation;
              const edit_url = `https://store.steampowered.com/curator/${curator}/admin/review_create/${appid}`

              if (unListed) {
                const match = blurb.match(regex);
                if (match) {
                  app_name = match[1];
                }
              }

              const newItem = {
                appid, app_name, unListed, blurb, edit_url
              };
              result.push(newItem);
            }
          }

          console.log("page", start, count);
          resolve({ recommendations: result, total_count: data.total_count });
        })
        .catch((error) => {
          console.error(error);
          reject(null);
        });
    });
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
})();

GM_addStyle(`
.ctd_btn {
  padding: 3px;
  margin: 5px;
  display: block;
}
`);
