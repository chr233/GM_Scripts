// ==UserScript==
// @name            Show_English_Name
// @name:zh-CN      Steam显示英文游戏名
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.17
// @description     在商店页显示双语游戏名称，双击名称可以快捷搜索。
// @description:zh-CN  在商店页显示双语游戏名称，双击名称可以快捷搜索。
// @author          Chr_
// @include         /https://store\.steampowered\.com\/app\/\d+/
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_registerMenuCommand
// @grant           GM_setClipboard
// ==/UserScript==


(() => {
    "use strict";
    const mode = window.localStorage.getItem("sen_mode") ?? "c(e)";
    const pure = window.localStorage.getItem("sen_pure") ?? "关";
    const icon = window.localStorage.getItem("sen_icon") ?? "开";

    const appid = (window.location.pathname.match(/\/app\/(\d+)/) ?? [null, null])[1];
    if (appid === null) { return; }
    fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=english`)
        .then(async (response) => {
            if (response.ok) {
                const json = await response.json();
                const data = json[appid];
                if (data.success !== true) { return; }

                let { name: name_en, supported_languages, categories } = data.data;

                const t = setInterval(() => {
                    const ele_title = document.getElementById("appHubAppName");
                    if (ele_title != null) {
                        clearInterval(t);
                        const ele_path = document.querySelector("div.blockbg>a:last-child");
                        let name_cur = ele_title.textContent;
                        if (name_cur.toLowerCase() != name_en.toLowerCase()) {
                            if (pure === "开") {
                                name_en = pureName(name_en);
                                name_cur = pureName(name_cur);
                            }
                            let name_new = "";
                            if (mode === "e(c)") {
                                name_new = `${name_en} (${name_cur})`;
                            } else {
                                name_new = `${name_cur} (${name_en})`;
                            }

                            ele_title.textContent = name_new;
                            if (ele_path !== null) {
                                ele_path.textContent = name_new;
                            }
                        }

                        if (icon === "开") {
                            if (supported_languages && supported_languages.search('Chinese') !== -1) {
                                ele_title.textContent += "🀄";
                            }
                            if (categories && categories.some(c => c.id === 29)) {
                                ele_title.textContent += "📇";
                            }
                        }

                        ele_title.title = "双击快捷搜索";
                        ele_title.addEventListener("dblclick", () => {
                            ShowConfirmDialog(`你想做什么呢？`, "", "复制游戏名", "搜索游戏名")
                                .done(() => {
                                    const setClipboard = (data) => { GM_setClipboard(data, "text"); };
                                    if (name_cur == name_en) { setClipboard(name_cur); } else {
                                        ShowConfirmDialog(`要复制的游戏名称？`, "", name_cur, name_en)
                                            .done(() => { setClipboard(name_cur); })
                                            .fail((stats) => {
                                                if (stats) { setClipboard(name_en); }
                                            });
                                    }
                                })
                                .fail((stats) => {
                                    if (stats) {
                                        if (name_cur == name_en) {
                                            window.open(`https://store.steampowered.com/search/?term=${name_cur}`);
                                        } else {
                                            ShowConfirmDialog(`要使用的搜索关键词？`, "", name_cur, name_en)
                                                .done(() => { window.open(`https://store.steampowered.com/search/?term=${name_cur}`); })
                                                .fail((stats) => {
                                                    if (stats) { window.open(`https://store.steampowered.com/search/?term=${name_en}`); }
                                                });
                                        }
                                    }
                                });
                        });
                    }
                }, 500);
            } else {
                console.error(response.status);
            }
        })
        .catch((err) => {
            console.error(err);
        });
    GM_registerMenuCommand(`切换显示格式：【${mode === "c(e)" ? "原名 (英文名)" : "英文名 (原名)"}】`, () => {
        window.localStorage.setItem("sen_mode", mode === "c(e)" ? "e(c)" : "c(e)");
        window.location.reload();
    });
    GM_registerMenuCommand(`过滤特殊符号：【${pure}】`, () => {
        window.localStorage.setItem("sen_pure", pure === "开" ? "关" : "开");
        window.location.reload();
    });
    GM_registerMenuCommand(`显示卡牌图标：【${icon}】`, () => {
        window.localStorage.setItem("sen_icon", icon === "开" ? "关" : "开");
        window.location.reload();
    });
    function pureName(str) {
        return str.replace(/[《》™©®]/g, "");
    }
})();
