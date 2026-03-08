// ==UserScript==
// @name:zh-CN      鉴赏家测评导出工具
// @name            Curator_Tools_Dump
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
// @version         1.4
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

  window.addEvent = addEventListener("load", init);

  async function init() {
    const [_, curatorId] = location.pathname.match(
      /\/curator\/([^\/]+)\/admin/
    ) ?? [null, null];

    if (!curatorId) {
      console.log("提取 curator 失败");
      return;
    }

    const eleContainer = document.querySelector("div.admin_nav");
    if (eleContainer) {
      setupGui(curatorId, eleContainer);
    }
  }

  async function setupGui(curator, container) {
    const db = new DBHelper();
    await db.initDB();

    if (!db) {
      showAlert("数据库初始化失败", false);
      return;
    }

    const btnStatus = genBtn("获取缓存数量", "ctd_btn", async () => {
      const count = await db.getTotalCount();
      btnStatus.textContent = `缓存数量：${count}`;
    })
    container.appendChild(btnStatus);

    const btnLoadFast = genBtn("从评测列表抓取 (快速)", "ctd_btn", () => {
      btnLoadFast.disabled = true;

      getFullAppsList(curator, btnLoadFast).then(async (result) => {
        const data = result;
        console.log(data);

        await db.batchInsertData(data);
        btnLoadFast.disabled = false;
      });
    })
    container.appendChild(btnLoadFast);

    const btnLoadSlow = genBtn("从流量统计抓取 (慢)", "ctd_btn", () => {
      btnLoadSlow.disabled = true;

      getFullStateList(db, curator, btnLoadSlow).then(async (result) => {
        const data = result;
        console.log(data);

        await db.batchInsertData(data);
        btnLoadSlow.disabled = false;
      });
    })
    container.appendChild(btnLoadSlow);

    const btnDumpAll = genBtn("导出全部评测", "ctd_btn", async () => {
      const data = await db.getAllData();
      dumpData(data, "全部评测");
    });
    container.appendChild(btnDumpAll);

    const btnDumpError = genBtn("导出异常评测", "ctd_btn", async () => {
      const data = await db.getAllData();
      const dump = data.filter(x => x.unListed);
      if (!dump || dump.length === 0) {
        showAlert("没有异常评测数据可导出", false);
      } else {
        dumpData(dump, "异常评测");
      }
    });
    container.appendChild(btnDumpError);

    const btnClear = genBtn("清除缓存", "ctd_btn", async () => {
      await db.deleteAllData();
    })
    container.appendChild(btnClear);
  }

  function genBtn(text, cls, foo) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = cls;
    btn.addEventListener("click", foo);
    return btn;
  }

  function showAlert(text, success = true) {
    return ShowAlertDialog(`${success ? "✅" : "❌"}`, text);
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

  function dumpData(data, name) {
    const csv = convertToCsv(data);
    downloadCsv(csv, name);
  }

  function parseHtml(html) {
    try {
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(html, 'text/html');
      return (htmlDoc);
    } catch (err) {
      console.error(`DOMParser 解析失败：${err.message}`);
      return null;
    }
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

  async function getFullStateList(db, curator, eleBtn) {
    // 分页数量
    const pageSize = 10;

    eleBtn.textContent = "正在加载第一页数据";

    const firstPageResponse = await getStatistics(curator, 0, pageSize);
    if (!firstPageResponse) {
      return null;
    }

    const { total_count, appIds } = firstPageResponse;
    const fullList = [...appIds];

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
            subTasks.push(getStatistics(a, b, c));
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
            if (result && result.results) {
              result.results.forEach(item => {
                const { appid, app_name, unListed } = item;

                if (!db.queryByAppId(appid)) {
                  fullList.push(appid);
                }

              });
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

  function getStatistics(curator, start, count) {
    return new Promise((resolve, reject) => {
      const url = `https://store.steampowered.com/curator/${curator}/admin/ajaxgetreferralsdata/render/?query=top&start=${start}&count=${count}`;
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const { success, start, total_count, results_html } = data;

          const results = [];

          if (success) {

            const dom = parseHtml(results_html);
            const eleAs = dom.querySelectorAll("td.review_title>a");

            const regex = /app\/(\d+)\//;

            for (let eleA of eleAs) {
              const href = eleA.getAttribute("href");

              const match = href.match(regex);
              if (match) {
                const appid = match[1];
                const app_name = a.textContent.trim();
                const edit_url = `https://store.steampowered.com/curator/${curator}/admin/review_create/${appid}`

                results.push({ appid, app_name, unListed: true, edit_url });
              }
            }
          }

          console.log("page", start, total_count);
          resolve({ results, total_count });
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

  class DBHelper {
    #DB_NAME = 'Curator_Tools_Dump'; // 数据库名
    #DB_VERSION = 1; // 数据库版本
    #STORE_NAME = 'reviews'; // 存储对象仓库名
    #INDEX_NAME = 'idx_gameName'; // 索引名

    #DbInstance = null;

    /**
     * 初始化数据库连接（内部复用连接）
     * @returns {Promise<IDBDatabase>} 数据库实例
     */
    initDB() {
      // 如果已有连接，直接返回
      if (this.#DbInstance) {
        return Promise.resolve(this.#DbInstance);
      }

      return new Promise((resolve, reject) => {
        // 打开数据库
        const request = indexedDB.open(this.#DB_NAME, this.#DB_VERSION);

        // 数据库版本升级/首次创建时初始化结构
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.#STORE_NAME)) {
            const store = db.createObjectStore(this.#STORE_NAME, { keyPath: 'appid', autoIncrement: false });
            store.createIndex(this.#INDEX_NAME, 'app_name', { unique: false });
          }
        };

        // 打开成功：缓存连接
        request.onsuccess = (e) => {
          this.#DbInstance = e.target.result;

          this.#DbInstance.onclose = () => {
            this.#DbInstance = null;
          };

          resolve(this.#DbInstance);
        };

        // 打开失败
        request.onerror = (e) => {
          reject(new Error(`数据库连接失败：${e.target.error.message}`));
        };
      });
    }

    /**
        * 单条插入/更新数据（存在则更新，不存在则新增）
        * @param {Object} data 要插入的数据（必须包含AppId字段）
        * @param {IDBObjectStore} store 已开启的对象仓库（批量操作时复用）
        * @returns {Promise<{success: boolean, message: string, data: Object}>} 操作结果
        */
    #insertSingleData(data, store) {
      // 1. 数据合法性校验
      if (typeof data !== 'object' || data === null) {
        return Promise.resolve({
          success: false,
          message: '插入的数据必须是对象类型',
          data
        });
      }

      // 2. 执行插入/更新
      return new Promise((resolve) => {
        const putRequest = store.put(data);
        putRequest.onsuccess = () => {
          resolve({
            success: true,
            message: `数据操作成功（${putRequest.result === data.AppId ? '新增' : '更新'}），AppId：${data.AppId}`,
            data
          });
        };
        putRequest.onerror = (e) => {
          resolve({
            success: false,
            message: `数据操作失败：${e.target.error.message}`,
            data
          });
        };
      });
    }

    /**
     * 插入/更新单条数据（对外暴露的单条接口）
     * @param {Object} data 要插入的数据
     * @returns {Promise<{success: boolean, message: string, data: Object}>} 操作结果
     */
    async insertData(data) {
      try {
        const transaction = this.#DbInstance.transaction(this.#STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.#STORE_NAME);
        return this.#insertSingleData(data, store);
      } catch (err) {
        console.error('插入数据异常：', err);
        return {
          success: false,
          message: `插入数据异常：${err.message}`,
          data
        };
      }
    }

    /**
     * 批量插入/更新数据（复用单个事务，性能最优）
     * @param {Array<Object>} dataList 要批量插入的数据数组
     * @returns {Promise<{
     *   total: number,        // 总条数
     *   successCount: number, // 成功条数
     *   failCount: number,    // 失败条数
     *   results: Array<{success: boolean, message: string, data: Object}> // 每条数据的操作结果
     * }>} 批量操作结果
     */
    async batchInsertData(dataList) {
      // 1. 基础校验：必须是数组且非空
      if (!Array.isArray(dataList) || dataList.length === 0) {
        return {
          total: 0,
          successCount: 0,
          failCount: 0,
          results: [{ success: false, message: '批量插入的数据必须是非空数组', data: null }]
        };
      }

      try {
        // 2. 开启单个读写事务（批量操作核心：复用事务，减少性能开销）
        const transaction = this.#DbInstance.transaction(this.#STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.#STORE_NAME);

        // 3. 批量执行单条插入（并行处理）
        const promiseList = dataList.map(data => this.#insertSingleData(data, store));
        const results = await Promise.all(promiseList);

        // 4. 统计结果
        const successCount = results.filter(item => item.success).length;
        const failCount = results.length - successCount;

        return {
          total: dataList.length,
          successCount,
          failCount,
          results
        };
      } catch (err) {
        console.error('批量插入数据异常：', err);
        return {
          total: dataList.length,
          successCount: 0,
          failCount: dataList.length,
          results: dataList.map(data => ({
            success: false,
            message: `批量插入异常：${err.message}`,
            data
          }))
        };
      }
    }

    /**
     * 简单查询（支持按AppId/游戏名字段查询）
     * @param {string} field 查询字段（仅支持AppId/游戏名）
     * @param {string|number} value 查询值
     * @returns {Promise<Object|null>} 查询结果（无结果返回null）
     */
    async queryByAppId(appId) {
      try {
        const transaction = this.#DbInstance.transaction(this.#STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.#STORE_NAME);
        const request = store.get(appId);

        return new Promise((resolve) => {
          request.onsuccess = () => {
            resolve(request.result); // 无结果返回null
          };
          request.onerror = () => {
            resolve(null);
          };
        });
      } catch (err) {
        console.error('查询失败：', err);
        return null;
      }
    }

    /**
   * 简单查询（支持按AppId/游戏名字段查询）
   * @param {string} field 查询字段（仅支持AppId/游戏名）
   * @param {string|number} value 查询值
   * @returns {Promise<Object|null>} 查询结果（无结果返回null）
   */
    async queryName(name) {
      try {
        const transaction = this.#DbInstance.transaction(this.#STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.#STORE_NAME);
        const index = store.index(this.#INDEX_NAME);
        const request = index.get(name);

        return new Promise((resolve) => {
          request.onsuccess = () => {
            resolve(request.result); // 无结果返回null
          };
          request.onerror = () => {
            resolve(null);
          };
        });
      } catch (err) {
        console.error('查询失败：', err);
        return null;
      }
    }

    /**
     * 获取数据总数
     * @returns {Promise<number>} 数据行数
     */
    async getTotalCount() {
      try {
        const transaction = this.#DbInstance.transaction(this.#STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.#STORE_NAME);
        const countRequest = store.count();

        return new Promise((resolve) => {
          countRequest.onsuccess = () => {
            resolve(countRequest.result);
          };
        });
      } catch (err) {
        console.error('获取总数失败：', err);
        return 0;
      }
    }

    /**
     * 获取全部数据
     * @returns {Promise<Array>} 所有数据数组
     */
    async getAllData() {
      try {
        const transaction = this.#DbInstance.transaction(this.#STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.#STORE_NAME);
        const getAllRequest = store.getAll();

        return new Promise((resolve) => {
          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result || []);
          };
        });
      } catch (err) {
        console.error('获取全部数据失败：', err);
        return [];
      }
    }

    /**
     * 删除全部数据
     * @returns {Promise<boolean>} 是否删除成功
     */
    async deleteAllData() {
      try {
        const transaction = this.#DbInstance.transaction(this.#STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.#STORE_NAME);
        const clearRequest = store.clear();

        return new Promise((resolve) => {
          clearRequest.onsuccess = () => {
            resolve(true);
          };
          clearRequest.onerror = () => {
            resolve(false);
          };
        });
      } catch (err) {
        console.error('删除全部数据失败：', err);
        return false;
      }
    }

    /**
     * 关闭数据库连接（可选）
     */
    closeDB() {
      if (this.#DbInstance) {
        this.#DbInstance.close();
        this.#DbInstance = null;
        console.log('数据库连接已关闭');
      }
    }
  }

})();

GM_addStyle(`
.ctd_btn {
  padding: 3px;
  margin: 5px;
  display: block;
}
`);
