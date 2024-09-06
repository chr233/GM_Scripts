// ==UserScript==
// @name:zh-CN   补充包合成器增强
// @name         Boosterpack_Enhance
// @namespace    https://blog.chrxw.com
// @version      1.0
// @description  补充包合成器增强
// @description:zh-CN  补充包合成器增强
// @author       Chr_
// @match        https://steamcommunity.com/tradingcards/boostercreator*
// @match        https://steamcommunity.com//tradingcards/boostercreator/*
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://unpkg.com/tabulator-tables@6.2.5/dist/js/tabulator.min.js
// @resource     css https://unpkg.com/tabulator-tables@6.2.5/dist/css/tabulator_midnight.min.css
// ==/UserScript==

(() => {
    'use strict';

    const g_boosterData = {};
    const g_faveriteBooster = new Set();

    GM_addStyle(GM_getResourceText("css"));

    setTimeout(async () => {

        loadFavorite();

        await initBoosterData();

        initPanel();

    }, 200);

    window.addEventListener("beforeunload", saveFavorite);

    function initPanel() {
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
        function genCheckbox(name, cls, checked = false) {
            const l = document.createElement("label");
            const i = document.createElement("input");
            const s = genSpan(name);
            i.textContent = name;
            i.title = name;
            i.type = "checkbox";
            i.className = "fac_checkbox";
            i.checked = checked;
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

        const [lblOnlyFavorite, chkOnlyFavorite] = genCheckbox("仅显示已收藏", "bh-checkbox", false);
        chkOnlyFavorite.addEventListener("change", updateFilter);
        filterContainer.appendChild(lblOnlyFavorite);
        const [lblOnlyCraftable, chkOnlyCraftable] = genCheckbox("仅显示可合成", "bh-checkbox", false);
        chkOnlyCraftable.addEventListener("change", updateFilter);
        filterContainer.appendChild(lblOnlyCraftable);

        const btnSearch = genButton("清除过滤条件", () => {
            iptSearch.value = "";
            chkOnlyFavorite.checked = false;
            chkOnlyCraftable.checked = false;
            updateFilter();
        }, "bh-button");
        filterContainer.appendChild(btnSearch);

        const tableContainer = genDiv("bh-table");
        area.appendChild(tableContainer);

        var tabledata = Object.values(g_boosterData);

        var rowMenu = [
            {
                label: "收藏 / 取消收藏",
                action: doEditFavorite,
            }, {
                label: "合成补充包",
                action: doCraftBooster,
            },
        ]

        const table = new Tabulator(tableContainer, {
            height: 500, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
            data: tabledata, //assign data to table
            layout: "fitDataStretch", //fit columns to width of table (optional)
            rowContextMenu: rowMenu,
            initialSort: [
                { column: "favorite", dir: "desc" }, //sort by this first
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
            craftBoosterpack(appid)
                .then((json) => {
                    console.log(json);

                })
                .catch((err) => {
                    console.error(err);
                    alert("合成失败");
                });
        }

        function updateFilter() {
            const filters = [{ field: "keywords", type: "like", value: iptSearch.value.trim() }];
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
            const src = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_231x87.jpg`
            const image = genImage(src, "be-row-image");
            return image;
        };

        function operatorFormatter(cell, formatterParams, onRendered) {
            const contailer = genDiv();
            const data = cell.getRow().getData();

            const benCraft = genButton("合成", (e) => doCraftBooster(e, cell.getRow()), "bh-button");

            if (data.available_at_time) {
                benCraft.disabled = true;
                benCraft.textContent = data.available_at_time;
            }

            contailer.appendChild(benCraft);
            return contailer;
        };
    }

    // 读取补充包列表
    async function initBoosterData() {
        const matchSpace = new RegExp(/\s/g);

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
        }

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
                    keywords = `${appid}${name}`.replace(matchSpace, "").toLowerCase();
                } else {
                    fullName = `${name} (${nameEn})`;
                    keywords = `${appid}${name}${nameEn}`.replace(matchSpace, "").toLowerCase();
                }

                const cardSet = gemPrice2SetCount[intPrice] ?? 0;
                const favorite = g_faveriteBooster.has(`${appid}`);

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
                };
            }
        }

    }

    function parseBoosterData(html) {
        const matchJson = new RegExp(/CBoosterCreatorPage\.Init\(([\s\S]+}]),\s*parseFloat/);
        const result = html.match(matchJson);
        if (result) {
            var json = result[1];
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
                    resolve(json);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
})();

GM_addStyle(`
img.be-row-image {
  width: 90px;
  height: auto;
}
`);