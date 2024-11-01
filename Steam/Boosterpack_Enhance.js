// ==UserScript==
// @name:zh-CN   补充包合成器增强
// @name         Boosterpack_Enhance
// @namespace    https://blog.chrxw.com
// @version      1.3
// @description  补充包制作工具
// @description:zh-CN  补充包制作工具
// @author       Chr_
// @match        https://steamcommunity.com/tradingcards/boostercreator*
// @match        https://steamcommunity.com//tradingcards/boostercreator/*
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://cdnjs.cloudflare.com/ajax/libs/tabulator/6.3.0/js/tabulator.min.js
// @resource     css https://cdnjs.cloudflare.com/ajax/libs/tabulator/6.3.0/css/tabulator_midnight.min.css
// ==/UserScript==

(() => {
    'use strict';

    const g_boosterData = {};
    const g_faveriteBooster = new Set();

    // 初始化
    setTimeout(async () => {
        loadFavorite();
        await initBoosterData();
        initPanel();
    }, 200);

    function genDiv(cls) {
        const d = document.createElement("div");
        d.className = cls;
        return d;
    }
    function genInput(cls) {
        const i = document.createElement("input");
        i.className = cls;
        return i;
    }
    function genSpan(name) {
        const s = document.createElement("span");
        s.textContent = name;
        return s;
    }
    function genCheckbox(name, cls, key = null, checked = false) {
        const l = document.createElement("label");
        const i = document.createElement("input");
        const s = genSpan(name);
        i.textContent = name;
        i.title = name;
        i.type = "checkbox";
        i.className = "fac_checkbox";
        i.checked = localStorage.getItem(key) === "true";
        l.title = name;
        l.appendChild(i);
        l.appendChild(s);
        return [l, i];
    }
    function genImage(url, cls = "bh-image") {
        const i = document.createElement("img");
        i.src = url;
        i.className = cls;
        return i;
    }
    function genButton(name, foo, cls = "bh-button") {
        const b = document.createElement("button");
        b.textContent = name;
        b.title = name;
        b.className = cls;
        b.addEventListener("click", foo);
        return b;
    }

    function initPanel() {
        const area = document.querySelector("div.booster_creator_area");

        const filterContainer = genDiv("bh-filter");
        area.appendChild(filterContainer);

        const iptSearch = genInput("bh-search");
        iptSearch.placeholder = "搜索名称 / AppId";
        let t = 0;
        iptSearch.addEventListener("keydown", () => {
            clearTimeout(t);
            t = setTimeout(updateFilter, 500);
        });
        filterContainer.appendChild(iptSearch);

        const [lblOnlyFavorite, chkOnlyFavorite] = genCheckbox("仅显示已收藏", "bh-checkbox", "bh-onlyfavorite", false);
        chkOnlyFavorite.addEventListener("change", updateFilter);
        filterContainer.appendChild(lblOnlyFavorite);
        const [lblOnlyCraftable, chkOnlyCraftable] = genCheckbox("仅显示可合成", "bh-checkbox", "bh-onlycraftable", false);
        chkOnlyCraftable.addEventListener("change", updateFilter);
        filterContainer.appendChild(lblOnlyCraftable);

        const btnSearch = genButton("清除过滤条件", () => {
            iptSearch.value = "";
            chkOnlyFavorite.checked = false;
            chkOnlyCraftable.checked = false;
            updateFilter();
        }, "bh-button");
        filterContainer.appendChild(btnSearch);
        filterContainer.appendChild(genSpan(""));

        const tabledata = Object.values(g_boosterData);

        const btnBatchCraft = genButton("批量合成收藏的包", async () => {
            const favoriteItems = tabledata.filter(x => x.favorite && x.available);
            if (favoriteItems.length === 0) {
                alert("无可合成项目");
            } else {
                for (let fav of favoriteItems) {
                    await doCraftBooster2(fav.appid, fav.contailer);
                    await asleep(200);
                }
            }
        }, "bh-button-right");
        filterContainer.appendChild(btnBatchCraft);

        const tableContainer = genDiv("bh-table");
        area.appendChild(tableContainer);

        const rowMenu = [
            {
                label: "收藏 / 取消收藏",
                action: doEditFavorite,
            }, {
                label: "合成补充包",
                action: doCraftBooster,
            },
        ];

        const table = new Tabulator(tableContainer, {
            height: 600,
            data: tabledata,
            layout: "fitDataStretch",
            rowHeight: 40,
            rowContextMenu: rowMenu,
            initialSort: [
                { column: "favorite", dir: "desc" },
            ],
            columns: [
                { title: "AppId", field: "appid" },
                { title: "图片", field: "appid", formatter: appImageFormatter, headerSort: false, width: 100, resizable: false },
                { title: "名称", field: "fullName", width: 300 },
                { title: "张数", field: "cardSet" },
                { title: "宝珠", field: "gemPrice" },
                {
                    title: "收藏",
                    field: "favorite",
                    formatter: "tickCross",
                    sorter: "boolean",
                    cellClick: (e, cell) => doEditFavorite(e, cell.getRow()),
                },
                { title: "合成", field: "available", formatter: "tickCross", sorter: "boolean" },
                { title: "操作", field: "available", frozen: true, formatter: operatorFormatter, headerSort: false },
            ],
        });

        window.addEventListener("hashchange", () => {
            const appId = location.hash.replace("#", "");
            iptSearch.value = appId;
            updateFilter();
        });

        window.addEventListener("beforeunload", () => {
            localStorage.setItem("bh-onlyfavorite", chkOnlyFavorite.checked);
            localStorage.setItem("bh-onlycraftable", chkOnlyCraftable.checked);
        });

        updateFilter();

        function doEditFavorite(e, row) {
            const cell = row.getCell("favorite");
            const newValue = !cell.getValue();
            cell.setValue(newValue);
            const appId = row.getCell("appid").getValue();
            const strAppId = `${appId}`;
            if (newValue) {
                g_faveriteBooster.add(strAppId);
            } else {
                g_faveriteBooster.delete(strAppId);
            }
            saveFavorite();
        }

        function doCraftBooster(e, row) {
            const appid = row.getCell("appid").getValue();
            const available = row.getCell("available").getValue();
            const container = row.getCell("container").getValue();
            if (available) {
                doCraftBooster2(appid, container);
            }
        }

        function updateFilter() {
            const filters = [{ field: "keywords", type: "like", value: iptSearch.value.trim(), matchAll: true }];
            if (chkOnlyFavorite.checked) {
                filters.push({ field: "favorite", type: "=", value: true });
            }
            if (chkOnlyCraftable.checked) {
                filters.push({ field: "available", type: "=", value: true });
            }
            table.setFilter(filters);
        }

        function appImageFormatter(cell, formatterParams, onRendered) {
            const appid = cell.getValue();
            const src = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_231x87.jpg`;
            const image = genImage(src, "be-row-image");
            return image;
        };

        function operatorFormatter(cell, formatterParams, onRendered) {
            const data = cell.getRow().getData();
            return data.contailer;
        };
    };

    function doCraftBooster2(appid, contailer) {
        let btn = contailer.querySelector("button");
        if (btn) {
            btn.disabled = true;
        }
        craftBoosterpack(appid)
            .then((success) => {
                if (success) {
                    g_boosterData[appid].available = false;
                    contailer.innerHTML = "";
                    contailer.appendChild(genSpan("合成成功"));
                    btn = null;
                } else {
                    btn.textContent = "合成失败";
                }
            })
            .catch((err) => {
                console.error(err);
                btn.textContent = "合成失败";
            }).finally(() => {
                if (btn) {
                    btn.disabled = false;
                }
            });
    }

    // 读取补充包列表
    async function initBoosterData() {
        const gemPrice2SetCount = {
            1200: 5,
            1000: 6,
            857: 7,
            750: 8,
            667: 9,
            600: 10,
            545: 11,
            500: 12,
            462: 13,
            429: 14,
            400: 15
        };

        const currentData = parseBoosterData(document.body.innerHTML);

        const nameEnDict = {};
        if (g_strLanguage !== "english") {
            const html = await loadSecondLanguage("english");
            const secondData = parseBoosterData(html);

            for (const { appid, name } of secondData) {
                if (appid && name) {
                    nameEnDict[appid] = name;
                }
            }
        }

        for (const item of currentData) {
            const { appid, name, unavailable, price, series, available_at_time } = item;
            const intPrice = parseInt(price);
            if (appid && name && intPrice === intPrice) {
                const nameEn = nameEnDict[appid] ?? "";
                let fullName;
                let keywords;
                if (name === nameEn) {
                    fullName = name;
                    keywords = `${appid} ${name}`.toLowerCase();
                } else {
                    fullName = `${name} (${nameEn})`;
                    keywords = `${appid} ${name} ${nameEn}`.toLowerCase();
                }

                const cardSet = gemPrice2SetCount[intPrice] ?? 0;
                const favorite = g_faveriteBooster.has(`${appid}`);

                //生成按钮
                const contailer = genDiv();
                if (!available_at_time) {
                    const benCraft = genButton("合成补充包", (e) => doCraftBooster2(appid, contailer), "bh-button");
                    contailer.appendChild(benCraft);
                } else {
                    const time = genSpan(available_at_time);
                    time.className = "bh-tips";
                    contailer.appendChild(time);
                }

                g_boosterData[appid] = {
                    appid,
                    fullName,
                    gemPrice: intPrice,
                    keywords,
                    series,
                    cardSet,
                    available_at_time,
                    available: !unavailable,
                    favorite,
                    contailer,
                };
            }
        }
    }

    function parseBoosterData(html) {
        const matchJson = new RegExp(/CBoosterCreatorPage\.Init\(([\s\S]+}]),\s*parseFloat/);
        const result = html.match(matchJson);
        if (result) {
            const json = result[1];
            return JSON.parse(json);
        } else {
            return [];
        }
    }

    function loadFavorite() {
        const value = localStorage.getItem("be_faviorite") ?? "";
        const arr = value.split('|').filter(x => x);

        g_faveriteBooster.clear();
        for (const item of arr) {
            g_faveriteBooster.add(item);
        }
    }

    function saveFavorite() {
        const value = Array.from(g_faveriteBooster).join('|');
        console.log(g_faveriteBooster);
        localStorage.setItem("be_faviorite", value);
    }

    // 加载第二语言
    function loadSecondLanguage(lang) {
        return new Promise((resolve, reject) => {
            fetch(
                `https://steamcommunity.com/tradingcards/boostercreator/?l=${lang}`,
                {
                    method: "GET",
                    credentials: "include",
                })
                .then((response) => {
                    return response.text();
                })
                .then((text) => {
                    resolve(text);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    // 合成补充包
    function craftBoosterpack(appId) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("sessionid", g_sessionID);
            formData.append("appid", appId);
            formData.append("series", "1");
            formData.append("tradability_preference", "2");

            fetch(
                "https://steamcommunity.com/tradingcards/ajaxcreatebooster/",
                {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                })
                .then(response => {
                    return response.json();
                })
                .then((json) => {
                    if (json.purchase_result) {
                        const { success } = json.purchase_result;
                        resolve(success === 1);
                    }
                    resolve(false);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    //异步延时
    function asleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
})();

GM_addStyle(GM_getResourceText("css"));
GM_addStyle(`
img.be-row-image {
  width: 90px;
  height: auto;
}
div.bh-filter {
  padding: 10px 0;
}
div.bh-filter > * {
  margin-right: 10px;
}
button.bh-button-right {
  position: absolute;
  right: 10px;
}
span.bh-tips {
  font-size: 10px;
}
`);