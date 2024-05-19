// ==UserScript==
// @name:zh-CN      Steam快速添加购物车
// @name            Fast_Add_Cart
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         4.2
// @description:zh-CN  超级方便的添加购物车体验, 不用跳转商店页, 附带导入导出购物车功能.
// @description     Add to cart without redirect to cart page, also provide import/export cart feature.
// @author          Chr_
// @match           https://store.steampowered.com/*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_addStyle
// @grant           GM_setClipboard
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_registerMenuCommand
// ==/UserScript==

(async () => {
    "use strict";

    // 多语言
    const LANG = {
        ZH: {
            langName: "中文",
            changeLang: "修改插件语言",
            facInputBoxPlaceHolder:
                "一行一条, 自动忽略【#】后面的内容, 支持的格式如下: (自动保存)",
            storeLink: "商店链接",
            steamDBLink: "DB链接",
            import: "导入",
            importDesc: "从文本框批量添加购物车(从上到下导入)",
            importDesc2: "当前页面无法导入购物车",
            export: "导出",
            exportDesc: "将购物车内容导出至文本框",
            exportConfirm: "输入框中含有内容, 请选择操作?",
            exportConfirmReplace: "覆盖原有内容",
            exportConfirmAppend: "添加到最后",
            copy: "复制",
            copyDesc: "复制文本框中的内容",
            copyDone: "复制到剪贴板成功",
            reset: "清除",
            resetDesc: "清除文本框和已保存的数据",
            resetConfirm: "您确定要清除文本框和已保存的数据吗？",
            history: "历史",
            historyDesc: "查看购物车历史记录",
            reload: "刷新",
            reloadDesc: "重新读取保存的购物车内容",
            reloadConfirm: "您确定要重新读取保存的购物车数据吗？",
            goBack: "返回",
            goBackDesc: "返回你当前的购物车",
            clear: "清空购物车",
            clearDesc: "清空购物车",
            clearConfirm: "您确定要移除所有您购物车中的物品吗？",
            help: "帮助",
            helpDesc: "显示帮助",
            helpTitle: "插件版本",
            formatError: "格式有误",
            chooseSub: "请选择SUB",
            operation: "操作中……",
            operationDone: "操作完成",
            addCart: "添加购物车",
            addCartTips: "添加到购物车……",
            addCartErrorSubNotFount: "未识别到SubID",
            noSubDesc: "可能尚未发行或者是免费游戏",
            inCart: "在购物车中",
            importingTitle: "正在导入购物车……",
            add: "添加",
            toCart: "到购物车",
            tips: "提示",
            ok: "是",
            no: "否",
            fetchingSubs: "读取可用SUB",
            noSubFound: "未找到可用SUB",
            networkError: "网络错误",
            addCartSuccess: "添加购物车成功",
            addCartError: "添加购物车失败",
            networkRequestError: "网络请求失败",
            unknownError: "未知错误",
            unrecognizedResult: "返回了未知结果",
            batchExtract: "批量提取",
            batchExtractDone: "批量提取完成",
            batchDesc: "AppID已提取, 可以在购物车页批量导入",
            onlyOnsale: " 仅打折",
            onlyOnsaleDesc: "勾选后批量导入时仅导入正在打折的游戏.",
            onlyOnsaleDesc2: "勾选后批量导出时仅导出正在打折的游戏.",
            notOnSale: "尚未打折, 跳过",
        },
        EN: {
            langName: "English",
            changeLang: "Change plugin language",
            facInputBoxPlaceHolder:
                "One line one item, ignore the content after #, support format: (auto save)",
            storeLink: "Store link",
            steamDBLink: "DB link",
            import: "Import",
            importDesc: "Batch add cart from textbox (from top to bottom)",
            importDesc2: "Current page can't import cart",
            export: "Export",
            exportDesc: "Export cart content to textbox",
            exportConfirm: "Textbox contains content, please choose operation?",
            exportConfirmReplace: "Replace original content",
            exportConfirmAppend: "Append to the end",
            copy: "Copy",
            copyDesc: "Copy textbox content",
            copyDone: "Copy to clipboard success",
            reset: "Reset",
            resetDesc: "Clear textbox and saved data",
            resetConfirm: "Are you sure to clear textbox and saved cart data?",
            history: "History",
            historyDesc: "View cart history",
            reload: "Reload",
            reloadDesc: "Reload saved cart date",
            reloadConfirm: "Are you sure to reload saved cart data?",
            goBack: "Back",
            goBackDesc: "Back to your cart",
            clear: "Clear",
            clearDesc: "Clear cart",
            clearConfirm: "Are you sure to remove all items in your cart?",
            help: "Help",
            helpDesc: "Show help",
            helpTitle: "Plugin Version",
            formatError: "Format error",
            chooseSub: "Please choose SUB",
            operation: "Operation in progress……",
            operationDone: "Operation done",
            addCart: "Add cart",
            addCartTips: "Adding to cart……",
            addCartErrorSubNotFount: "Unrecognized SubID",
            noSubDesc: "Maybe not released or free game",
            inCart: "In cart",
            importingTitle: "Importing cart……",
            add: "Add",
            toCart: "To cart",
            tips: "Tips",
            ok: "OK",
            no: "No",
            fetchingSubs: "Fetching available SUB",
            noSubFound: "No available SUB",
            networkError: "Network error",
            addCartSuccess: "Add cart success",
            addCartError: "Add cart failed",
            networkRequestError: "Network request failed",
            unknownError: "Unknown error",
            unrecognizedResult: "Returned unrecognized result",
            batchExtract: "Extract Items",
            batchExtractDone: "Batch Extract Done",
            batchDesc: "AppID list now saved, goto cart page to use batch import.",
            onlyOnsale: " Only on sale",
            onlyOnsaleDesc:
                "If checked, script will ignore games that is not on sale when import cart.",
            onlyOnsaleDesc2:
                "If checked, script will ignore games that is not on sale when export cart.",
            notOnSale: "Not on sale, skip",
        },
    };

    // 判断语言
    let language = GM_getValue("lang", "ZH");
    if (!language in LANG) {
        language = "ZH";
        GM_setValue("lang", language);
    }
    // 获取翻译文本
    const t = (key) => LANG[language][key] || key;

    {
        // 自动弹出提示
        const languageTips = GM_getValue("languageTips", true);
        if (languageTips && language === "ZH") {
            if (!document.querySelector("html").lang.startsWith("zh")) {
                ShowConfirmDialog(
                    "tips",
                    "Fast add cart now support English, switch?",
                    "Using English",
                    "Don't show again"
                )
                    .done(() => {
                        GM_setValue("lang", "EN");
                        GM_setValue("languageTips", false);
                        window.location.reload();
                    })
                    .fail((bool) => {
                        if (bool) {
                            showAlert(
                                "",
                                "You can switch the plugin's language using TamperMonkey's menu."
                            );
                            GM_setValue("languageTips", false);
                        }
                    });
            }
        }
        //注册菜单
        GM_registerMenuCommand(`${t("changeLang")} (${t("langName")})`, () => {
            switch (language) {
                case "EN":
                    language = "ZH";
                    break;
                case "ZH":
                    language = "EN";
                    break;
            }
            GM_setValue("lang", language);
            window.location.reload();
        });
    }

    //获取商店语言和区域
    const { LANGUAGE: storeLanguage, COUNTRY: userCountry } = JSON.parse(document.querySelector("#application_config")?.getAttribute("data-config") ?? "");
    const { webapi_token: accessToken } = JSON.parse(document.querySelector("#application_config")?.getAttribute("data-store_user_config") ?? "");

    const G_Objs = {};

    //初始化
    const pathname = window.location.pathname;
    if (
        pathname === "/search/" ||
        pathname === "/" ||
        pathname.startsWith("/tags/")
    ) {
        //搜索页,主页,标签页
        return;

        // let timer = setInterval(() => {
        //     let containers = document.querySelectorAll(
        //         [
        //             "#search_resultsRows",
        //             "#tab_newreleases_content",
        //             "#tab_topsellers_content",
        //             "#tab_upcoming_content",
        //             "#tab_specials_content",
        //             "#NewReleasesRows",
        //             "#TopSellersRows",
        //             "#ConcurrentUsersRows",
        //             "#TopRatedRows",
        //             "#ComingSoonRows",
        //         ].join(",")
        //     );
        //     if (containers.length > 0) {
        //         for (let container of containers) {
        //             clearInterval(timer);
        //             for (let ele of container.children) {
        //                 addButton(ele);
        //             }
        //             container.addEventListener("DOMNodeInserted", ({ relatedNode }) => {
        //                 if (relatedNode.parentElement === container) {
        //                     addButton(relatedNode);
        //                 }
        //             });
        //         }

        //         const searchBar = document.querySelector(".searchbar>.searchbar_left");
        //         if (searchBar !== null) {
        //             let btn = document.createElement("button");
        //             btn.addEventListener(
        //                 "click",
        //                 (e) => {
        //                     e.preventDefault();
        //                     const savedCart =
        //                         GM_getValue("btnv6_blue_hoverfade btn_small") ?? "";
        //                     const cartItems = savedCart.split("\n");
        //                     const regFull = new RegExp(/((app|a|bundle|b|sub|s)\/(\d+))/);
        //                     const regShort = new RegExp(/^(([\s]*|)(\d+))/);
        //                     const dataMap = new Set();

        //                     for (let line of cartItems) {
        //                         let match = line.match(regFull) ?? line.match(regShort);
        //                         if (match) {
        //                             let [_, link, _1, _2] = match;
        //                             dataMap.add(link);
        //                         }
        //                     }

        //                     const now = new Date().toLocaleString();
        //                     cartItems.push(`========【${now}】=========`);

        //                     const rows = document.querySelectorAll("#search_resultsRows>a");
        //                     for (let row of rows) {
        //                         if (
        //                             row.className.includes("ds_owned") ||
        //                             row.className.includes("ds_ignored")
        //                         ) {
        //                             continue;
        //                         }

        //                         const url = row.href;
        //                         const title =
        //                             row.querySelector("span.title")?.textContent ?? "null";

        //                         let match = url.match(regFull);
        //                         if (match) {
        //                             let [_, link, _1, _2] = match;

        //                             if (!dataMap.has(link)) {
        //                                 cartItems.push(`${link} #${title}`);
        //                             }
        //                         }
        //                     }
        //                     GM_setValue("fac_cart", cartItems.join("\n"));
        //                     const dialog = showAlert(
        //                         t("batchExtractDone"),
        //                         t("batchDesc"),
        //                         true
        //                     );
        //                     setTimeout(() => {
        //                         dialog.Dismiss();
        //                     }, 1500);
        //                 },
        //                 false
        //             );
        //             btn.className = "btnv6_blue_hoverfade btn_small";
        //             btn.innerHTML = `<span>${t("batchExtract")}</span>`;
        //             searchBar.appendChild(btn);
        //         }
        //     }
        // }, 500);
    } else if (
        pathname.startsWith("/publisher/") ||
        pathname.startsWith("/franchise/") ||
        pathname.startsWith("/developer/")
    ) {
        //发行商主页
        return;

        // let timer = setInterval(() => {
        //     let container = document.getElementById("RecommendationsRows");
        //     if (container != null) {
        //         clearInterval(timer);
        //         for (let ele of container.querySelectorAll("a.recommendation_link")) {
        //             addButton(ele);
        //         }
        //         container.addEventListener("DOMNodeInserted", ({ relatedNode }) => {
        //             if (relatedNode.nodeName === "DIV") {
        //                 for (let ele of relatedNode.querySelectorAll(
        //                     "a.recommendation_link"
        //                 )) {
        //                     addButton(ele);
        //                 }
        //             }
        //         });
        //     }
        // }, 500);
    } else if (
        pathname.startsWith("/app/") ||
        pathname.startsWith("/sub/") ||
        pathname.startsWith("/bundle/")
    ) {
        //商店详情页
        return;

        // let timer = setInterval(() => {
        //     let container = document.getElementById("game_area_purchase");
        //     if (container != null) {
        //         clearInterval(timer);
        //         for (let ele of container.querySelectorAll(
        //             "div.game_area_purchase_game"
        //         )) {
        //             addButton2(ele);
        //         }
        //     }
        // }, 500);
    } else if (pathname.startsWith("/wishlist/")) {
        //愿望单页
        return;

        // let timer = setInterval(() => {
        //     let container = document.getElementById("wishlist_ctn");
        //     if (container != null) {
        //         clearInterval(timer);

        //         for (let ele of container.querySelectorAll("div.wishlist_row")) {
        //             addButton3(ele);
        //         }
        //         container.addEventListener("DOMNodeInserted", ({ relatedNode }) => {
        //             if (relatedNode.nodeName === "DIV") {
        //                 for (let ele of relatedNode.querySelectorAll("div.wishlist_row")) {
        //                     addButton3(ele);
        //                 }
        //             }
        //         });
        //     }
        // }, 500);
    } else if (pathname.startsWith("/cart")) {
        //购物车页

        function genBr() {
            return document.createElement("br");
        }
        function genBtn(text, title, onclick) {
            let btn = document.createElement("button");
            btn.textContent = text;
            btn.title = title;
            btn.className = "btn_medium btnv6_blue_hoverfade fac_cartbtns";
            btn.addEventListener("click", onclick);
            return btn;
        }
        function genSpan(text) {
            let span = document.createElement("span");
            span.textContent = text;
            return span;
        }
        function genTxt(value, placeholder) {
            const t = document.createElement("textarea");
            t.className = "fac_inputbox";
            t.placeholder = placeholder;
            t.value = value;
            return t;
        }
        function genChk(name, title, checked = false) {
            const l = document.createElement("label");
            const i = document.createElement("input");
            const s = genSpan(name);
            i.textContent = name;
            i.title = title;
            i.type = "checkbox";
            i.className = "fac_checkbox";
            i.checked = checked;
            l.title = title;
            l.appendChild(i);
            l.appendChild(s);
            return [l, i];
        }

        const savedCart = GM_getValue("fac_cart") ?? "";
        const placeHolder = [
            t("facInputBoxPlaceHolder"),
            `1. ${t("storeLink")}: https://store.steampowered.com/app/xxx`,
            `2. ${t("steamDBLink")}:  https://steamdb.info/app/xxx`,
            "3. appID:       xxx a/xxx app/xxx",
            "4. subID:       s/xxx sub/xxx",
            "5. bundleID:    b/xxx bundle/xxx",
        ].join("\n");

        const inputBox = genTxt(savedCart, placeHolder);

        function fitInputBox() {
            inputBox.style.height =
                Math.min(inputBox.value.split("\n").length * 20 + 20, 900).toString() +
                "px";
        }

        inputBox.addEventListener("input", fitInputBox);
        G_Objs.inputBox = inputBox;
        fitInputBox();

        const originResetBtn = document.querySelector("div.remove_ctn");
        if (originResetBtn != null) {
            originResetBtn.style.display = "none";
        }

        const [lblDiscount, chkDiscount] = genChk(
            t("onlyOnsale"),
            t("onlyOnsaleDesc"),
            GM_getValue("fac_discount") ?? false
        );
        G_Objs.chkDiscount = chkDiscount;

        const btnImport = genBtn(`🔼${t("import")}`, t("importDesc"), async () => {
            inputBox.value = await importCart(
                inputBox.value,
                chkDiscount.checked
            );
        });

        const histryPage = pathname.search("history") !== -1;
        if (histryPage) {
            btnImport.disabled = true;
            btnImport.title = t("importDesc2");
            // btnImport2.disabled = true;
            // btnImport2.title = t("importDesc2");
        }

        const [lblDiscount2, chkDiscount2] = genChk(
            t("onlyOnsale"),
            t("onlyOnsaleDesc2"),
            GM_getValue("fac_discount2") ?? false
        );
        G_Objs.chkDiscount2 = chkDiscount2;

        const btnExport = genBtn(`🔽${t("export")}`, t("exportDesc"), async () => {
            let currentValue = inputBox.value.trim();
            const now = new Date().toLocaleString();

            var data = await exportCart(chkDiscount2.checked);

            if (currentValue !== "") {
                ShowConfirmDialog(
                    "",
                    t("exportConfirm"),
                    t("exportConfirmReplace"),
                    t("exportConfirmAppend")
                )
                    .done(() => {
                        inputBox.value = `========【${now}】=========\n` + data;
                        fitInputBox();
                    })
                    .fail((bool) => {
                        if (bool) {
                            inputBox.value = currentValue + `\n========【${now}】=========\n` + data;
                            fitInputBox();
                        }
                    });
            } else {
                inputBox.value =
                    `========【${now}】=========\n` + exportCart(chkDiscount2.checked);
                fitInputBox();
            }
        });

        const btnCopy = genBtn(`📋${t("copy")}`, t("copyDesc"), () => {
            GM_setClipboard(inputBox.value, "text");
            showAlert(t("tips"), t("copyDone"), true);
        });
        const btnClear = genBtn(`🗑️${t("reset")}`, t("resetDesc"), () => {
            ShowConfirmDialog("", t("resetConfirm"), t("ok"), t("no")).done(() => {
                inputBox.value = "";
                GM_setValue("fac_cart", "");
                fitInputBox();
            });
        });
        const btnReload = genBtn(`🔃${t("reload")}`, t("reloadDesc"), () => {
            ShowConfirmDialog("", t("reloadConfirm"), t("ok"), t("no")).done(() => {
                const s = GM_getValue("fac_cart") ?? "";
                inputBox.value = s;
                fitInputBox();
            });
        });
        const btnHistory = genBtn(`📜${t("history")}`, t("historyDesc"), () => {
            window.location.href =
                "https://help.steampowered.com/zh-cn/accountdata/ShoppingCartHistory";
        });
        const btnBack = genBtn(`↩️${t("goBack")}`, t("goBackDesc"), () => {
            window.location.href = "https://store.steampowered.com/cart/";
        });
        const btnForget = genBtn(`⚠️${t("clear")}`, t("clearDesc"), () => {
            ShowConfirmDialog("", t("clearConfirm"), t("ok"), t("no")).done(() => {
                deleteAccountCart()
                    .then(() => {
                        location.reload();
                    })
                    .catch((err) => {
                        console.error(err);
                        showAlert("出错", err, false);
                    });
            });
        });
        const btnHelp = genBtn(`🔣${t("help")}`, t("helpDesc"), () => {
            const {
                script: { version },
            } = GM_info;
            showAlert(
                `${t("helpTitle")} ${version}`,
                [
                    `<p>【🔼${t("import")}】${t("importDesc")}</p>`,
                    `<p>【✅${t("onlyOnsale")}】${t("onlyOnsaleDesc")}</p>`,
                    `<p>【🔽${t("export")}】${t("exportDesc")}</p>`,
                    `<p>【✅${t("onlyOnsale")}】${t("onlyOnsaleDesc2")}</p>`,
                    `<p>【📋${t("copy")}】${t("copyDesc")}</p>`,
                    `<p>【🗑️${t("reset")}】${t("resetDesc")}。</p>`,
                    `<p>【📜${t("history")}】${t("historyDesc")}</p>`,
                    `<p>【↩️${t("goBack")}】${t("goBackDesc")}</p>`,
                    `<p>【⚠️${t("clear")}】${t("clearDesc")}</p>`,
                    `<p>【🔣${t("help")}】${t("helpDesc")}</p>`,
                    `<p>【<a href="https://keylol.com/t747892-1-1" target="_blank">发布帖</a>】 【<a href="https://blog.chrxw.com/scripts.html" target="_blank">脚本反馈</a>】 【Developed by <a href="https://steamcommunity.com/id/Chr_" target="_blank">Chr_</a>】</p>`,
                ].join("<br>"),
                true
            );
        });

        const btnArea = document.createElement("div");
        btnArea.appendChild(btnImport);
        // btnArea.appendChild(btnImport2);
        btnArea.appendChild(lblDiscount);
        btnArea.appendChild(genSpan(" | "));
        btnArea.appendChild(btnExport);
        btnArea.appendChild(lblDiscount2);
        btnArea.appendChild(genSpan(" | "));
        btnArea.appendChild(btnHelp);

        const btnArea2 = document.createElement("div");
        btnArea2.appendChild(btnCopy);
        btnArea2.appendChild(btnClear);
        btnArea2.appendChild(btnReload);
        btnArea2.appendChild(genSpan(" | "));
        btnArea2.appendChild(histryPage ? btnBack : btnHistory);
        btnArea2.appendChild(genSpan(" | "));
        btnArea2.appendChild(btnForget);

        window.addEventListener("beforeunload", () => {
            GM_setValue("fac_cart", inputBox.value);
            GM_setValue("fac_discount", chkDiscount.checked);
            GM_setValue("fac_discount2", chkDiscount2.checked);
        });

        //等待购物车加载完毕, 显示额外面板
        const timer = setInterval(() => {
            const continer = document.querySelector("div[data-featuretarget='react-root']>div>div:last-child>div:last-child>div:first-child>div:last-child");
            if (continer) {
                clearInterval(timer);
                continer.appendChild(btnArea);
                continer.appendChild(genBr());
                continer.appendChild(inputBox);
                continer.appendChild(genBr());
                continer.appendChild(btnArea2);
            }
        }, 500);

    }

    // getStoreItem([730], null, null).then((data) => console.log(data)).catch(err => console.error(err))
    // getAccountCart().then((data) => console.log(data)).catch(err => console.error(err))
    // addItemsToAccountCart(null, [28627]).then((data) => console.log(data)).catch(err => console.error(err))

    //始终在右上角显示购物车按钮
    const cart_btn = document.getElementById("store_header_cart_btn");
    if (cart_btn !== null) {
        cart_btn.style.display = "";
    }

    //导入购物车
    function importCart(text, onlyOnSale = false) {
        const regFull = new RegExp(/(app|a|bundle|b|sub|s)\/(\d+)/);
        const regShort = new RegExp(/^([\s]*|)(\d+)/);

        return new Promise(async (resolve, reject) => {
            const dialog = showAlert(
                "导出购物车",
                `<h2 id="fac_diag" class="fac_diag">${t("operation")}</h2>`,
                true
            );

            const timer = setInterval(async () => {
                let txt = document.getElementById("fac_diag");
                if (txt) {
                    clearInterval(timer);

                    const txts = text.split("\n");

                    const result = [];

                    const appIds = [];
                    const subIds = [];
                    const bundleIds = [];

                    const targetSubIds = [];
                    const targetBundleIds = [];

                    try {
                        txt.textContent = "0/4 开始读取输入信息";

                        for (let line of txts) {
                            if (line.trim() === "") {
                                continue;
                            }
                            const tmp = line.split("#")[0];

                            const match = line.match(regFull) ?? line.match(regShort);
                            if (!match) {
                                if (line.search("=====") === -1) {
                                    result.push(`${tmp} #${t("formatError")}`);
                                } else {
                                    result.push(line);
                                }
                                continue;
                            }

                            let [_, type, subID] = match;
                            subID = parseInt(subID);
                            if (subID !== subID) {
                                result.push(`${tmp} #${t("formatError")}`);
                                continue;
                            }

                            switch (type.toLowerCase()) {
                                case "":
                                case "a":
                                case "app":
                                    type = "app";
                                    appIds.push(subID);
                                    break;
                                case "s":
                                case "sub":
                                    type = "sub";
                                    subIds.push(subID);
                                    break;
                                case "b":
                                case "bundle":
                                    type = "bundle";
                                    bundleIds.push(subID);
                                    break;
                                default:
                                    result.push(`${tmp} #${t("formatError")}`);
                                    continue;
                            }
                        }

                        const count = appIds.length + subIds.length + bundleIds.length;
                        txt.textContent = `1/4 成功读取 ${count} 个输入内容`;

                        if (count > 0) {
                            txt.textContent = "1/4 开始读取游戏信息";
                            const store_items = await getStoreItem(appIds, subIds, bundleIds);

                            console.log(store_items);

                            txt.textContent = "2/4 读取游戏信息成功";

                            for (let { appid, purchase_options } of store_items) {
                                if (!purchase_options) { continue; }

                                //输入值包含AppId, 解析可购买项
                                if (appIds.includes(appid)) {
                                    if (purchase_options.length >= 1) {
                                        const { packageid, bundleid, purchase_option_name: name, discount_pct: discount, formatted_final_price: price } = purchase_options[0];
                                        if (discount) {
                                            if (packageid) {
                                                result.push(`sub/${packageid} #app/${appid} #${name} 💳 ${price} 🔖 ${discount}`);
                                                targetSubIds.push(packageid);
                                            } else if (bundleid) {
                                                result.push(`bundle/${bundleid} #app/${appid} #${name} 💳 ${price} 🔖 ${discount}`);
                                                targetBundleIds.push(bundleid);
                                            }
                                        } else {
                                            if (packageid) {
                                                if (!onlyOnSale) {
                                                    result.push(`sub/${packageid} #app/${appid} #${name} 💳 ${price}`);
                                                    targetSubIds.push(packageid);
                                                } else {
                                                    result.push(`sub/${packageid} #app/${appid} #排除 #${name} 💳 ${price}`);
                                                }
                                            } else if (bundleid) {
                                                if (!onlyOnSale) {
                                                    result.push(`bundle/${bundleid} #app/${appid} #${name} 💳 ${price}`);
                                                    targetBundleIds.push(bundleid);
                                                } else {
                                                    result.push(`bundle/${bundleid} #app/${appid} #排除 #${name} 💳 ${price}`);
                                                }
                                            }
                                        }
                                    } else {
                                        result.push(`${tmp} #无可购买项目`);
                                    }
                                }

                                for (let { packageid, bundleid, purchase_option_name: name, discount_pct: discount, formatted_final_price: price } of purchase_options) {
                                    if (discount) {
                                        if (packageid && subIds.includes(packageid)) {
                                            result.push(`sub/${packageid} #${name} 💳 ${price} 🔖 ${discount}`);
                                            targetSubIds.push(packageid);
                                        } else if (bundleid && bundleIds.includes(bundleid)) {
                                            result.push(`bundle/${bundleid} #${name} 💳 ${price} 🔖 ${discount}`);
                                            targetBundleIds.push(bundleid);
                                        }
                                    } else {
                                        if (packageid && subIds.includes(packageid)) {
                                            if (!onlyOnSale) {
                                                result.push(`sub/${packageid} #${name} 💳 ${price}`);
                                                targetSubIds.push(packageid);
                                            } else {
                                                result.push(`sub/${packageid} #排除 #${name} 💳 ${price}`);

                                            }
                                        } else if (bundleid && bundleIds.includes(bundleid)) {
                                            if (!onlyOnSale) {
                                                result.push(`bundle/${bundleid} #${name} 💳 ${price}`);
                                                targetBundleIds.push(bundleid);
                                            } else {
                                                result.push(`bundle/${bundleid} #排除 #${name} 💳 ${price}`);
                                            }
                                        }
                                    }
                                }
                            }

                            txt.textContent = "3/4 解析游戏信息成功";

                            const data = await addItemsToAccountCart(targetSubIds, targetBundleIds, false);
                            console.log(data);

                            txt.textContent = "4/4 导入购物车成功";

                            dialog.Dismiss();

                            resolve(result.join("\n"));

                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);

                        } else {
                            txt.textContent = "4/4 尚未输入有效内容";
                            resolve(result.join("\n"));
                        }

                    } catch (err) {
                        txt.textContent = "导出购物车失败";
                        console.error(err);
                        resolve(result.join("\n"));
                    }
                }
            }, 200);
        });
    }
    //导出购物车
    async function exportCart(onlyOnsale = false) {
        return new Promise(async (resolve, reject) => {
            const dialog = showAlert(
                "导出购物车",
                `<h2 id="fac_diag" class="fac_diag">${t("operation")}</h2>`,
                true
            );

            const timer = setInterval(async () => {
                let txt = document.getElementById("fac_diag");
                if (txt) {
                    clearInterval(timer);

                    const result = [];

                    const subIds = [];
                    const bundleIds = [];
                    const gameNames = {};

                    try {
                        txt.textContent = "0/4 开始读取账号购物车";

                        const { line_items } = await getAccountCart();

                        if (line_items) {
                            for (let { packageid, bundleid } of line_items) {
                                if (packageid) {
                                    subIds.push(packageid);
                                }
                                else if (bundleid) {
                                    bundleIds.push(bundleid);
                                }
                            }
                        }

                        const count = subIds.length + bundleIds.length;
                        txt.textContent = `1/4 成功读取 ${count} 个购物车内容`;

                        if (count > 0) {
                            txt.textContent = "1/4 开始读取游戏信息";
                            const store_items = await getStoreItem(null, subIds, bundleIds);
                            txt.textContent = "2/4 读取游戏信息成功";

                            for (let { purchase_options } of store_items) {
                                if (!purchase_options) { continue; }

                                for (let { packageid, bundleid, purchase_option_name, discount_pct } of purchase_options) {
                                    let key;
                                    if (packageid) {
                                        key = `sub/${packageid}`;
                                    } else if (bundleid) {
                                        key = `bundle/${bundleid}`;
                                    }
                                    else {
                                        continue;
                                    }
                                    gameNames[key] = [`${purchase_option_name}`, discount_pct];
                                }
                            }

                            txt.textContent = "3/4 解析游戏信息成功";
                            txt.textContent = "3/4 开始导出购物车信息";
                            if (line_items) {
                                for (let { packageid, bundleid, price_when_added: { formatted_amount } } of line_items) {
                                    let key;
                                    if (packageid) {
                                        key = `sub/${packageid}`;
                                    } else if (bundleid) {
                                        key = `bundle/${bundleid}`;
                                    }
                                    const [name, discount] = gameNames[key] ?? "_";
                                    if (discount) {
                                        result.push(`${key} #${name} 💳 ${formatted_amount} 🔖 ${discount}`)
                                    } else if (!onlyOnsale) {
                                        result.push(`${key} #${name} 💳 ${formatted_amount}`)
                                    }
                                }
                            }

                            txt.textContent = "3/4 导出购物车信息成功";
                            dialog.Dismiss();

                            resolve(result.join("\n"));

                        } else {
                            txt.textContent = "4/4 购物车内容为空";
                            resolve(result.join("\n"));
                        }

                    } catch (err) {
                        txt.textContent = "读取账号购物车失败";
                        console.error(err);
                        resolve(result.join("\n"));
                    }
                }
            }, 200);
        });
    }

    // 获取游戏详情
    function getStoreItem(appIds = null, subIds = null, bundleIds = null) {
        return new Promise((resolve, reject) => {
            const ids = [];
            if (appIds) {
                for (let x of appIds) {
                    ids.push({ appid: x });
                }
            }
            if (subIds) {
                for (let x of subIds) {
                    ids.push({ packageid: x });
                }
            }
            if (bundleIds) {
                for (let x of bundleIds) {
                    ids.push({ bundleid: x });
                }
            }

            if (ids.length === 0) {
                reject([false, "未提供有效ID"]);
            }

            const payload = {
                ids,
                context: {
                    language: storeLanguage,
                    country_code: userCountry,
                    steam_realm: "1"
                },
                data_request: {
                    include_all_purchase_options: true
                }
            };
            const json = encodeURI(JSON.stringify(payload));
            fetch(
                `https://api.steampowered.com/IStoreBrowseService/GetItems/v1/?input_json=${json}`,
                {
                    method: "GET",
                }
            )
                .then(async (response) => {
                    if (response.ok) {
                        const { response: { store_items } } = await response.json();
                        resolve(store_items);
                    } else {
                        reject(t("networkRequestError"));
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    //读取购物车
    function getAccountCart() {
        return new Promise((resolve, reject) => {
            fetch(
                `https://api.steampowered.com/IAccountCartService/GetCart/v1/?access_token=${accessToken}`,
                {
                    method: "GET",
                }
            )
                .then(async (response) => {
                    if (response.ok) {
                        const { response: { cart } } = await response.json();
                        resolve(cart);
                    } else {
                        reject(t("networkRequestError"));
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    //添加购物车
    function addItemsToAccountCart(subIds = null, bundleIds = null, isPrivate = false) {
        return new Promise((resolve, reject) => {
            const items = [];
            if (subIds) {
                for (let x of subIds) {
                    items.push({ packageid: x });
                }
            }
            if (bundleIds) {
                for (let x of bundleIds) {
                    items.push({ bundleid: x });
                }
            }
            if (items.length === 0) {
                reject([false, "未提供有效ID"]);
            }

            for (let x of items) {
                x["gift_info"] = null; //giftInfo;
                x["flags"] = {
                    is_gift: false,
                    is_private: isPrivate == true
                };
            }

            const payload = {
                user_country: userCountry,
                items,
                navdata: {
                    domain: "store.steampowered.com",
                    controller: "default",
                    method: "default",
                    submethod: "",
                    feature: "spotlight",
                    depth: 1,
                    countrycode: userCountry,
                    webkey: 0,
                    is_client: false,
                    curator_data: {
                        clanid: null,
                        listid: null
                    },
                    is_likely_bot: false,
                    is_utm: false
                }
            };
            const json = JSON.stringify(payload);

            fetch(
                `https://api.steampowered.com/IAccountCartService/AddItemsToCart/v1/?access_token=${accessToken}`,
                {
                    method: "POST",
                    body: `input_json=${json}`,
                    headers: {
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    },
                }
            )
                .then(async (response) => {
                    if (response.ok) {
                        const { response: { cart } } = await response.json();
                        resolve(cart);
                    } else {
                        reject(t("networkRequestError"));
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    //删除购物车
    function deleteAccountCart() {
        return new Promise((resolve, reject) => {
            fetch(
                `https://api.steampowered.com/IAccountCartService/DeleteCart/v1/?access_token=${accessToken}`,
                {
                    method: "POST",
                }
            )
                .then(async (response) => {
                    if (response.ok) {
                        const { response: { line_item_ids, cart } } = await response.json();
                        resolve([line_item_ids, cart]);
                    } else {
                        reject(t("networkRequestError"));
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    //显示提示
    function showAlert(title, text, succ = true) {
        return ShowAlertDialog(`${succ ? "✅" : "❌"}${title}`, text);
    }
})();

GM_addStyle(`
button.fac_listbtns {
    display: none;
    position: relative;
    z-index: 100;
    padding: 1px;
  }
  a.search_result_row > button.fac_listbtns {
    top: -25px;
    left: 300px;
  }
  a.tab_item > button.fac_listbtns {
    top: -40px;
    left: 330px;
  }
  a.recommendation_link > button.fac_listbtns {
    bottom: 10px;
    right: 10px;
    position: absolute;
  }
  div.wishlist_row > button.fac_listbtns {
    top: 35%;
    right: 30%;
    position: absolute;
  }
  div.game_purchase_action > button.fac_listbtns {
    right: 8px;
    bottom: 8px;
  }
  button.fac_cartbtns {
    padding: 5px 8px;
  }
  button.fac_cartbtns:not(:last-child) {
    margin-right: 4px;
  }
  button.fac_cartbtns:not(:first-child) {
    margin-left: 4px;
  }
  a.tab_item:hover button.fac_listbtns,
  a.search_result_row:hover button.fac_listbtns,
  div.recommendation:hover button.fac_listbtns,
  div.wishlist_row:hover button.fac_listbtns {
    display: block;
  }
  div.game_purchase_action:hover > button.fac_listbtns {
    display: inline;
  }
  button.fac_choose {
    padding: 1px;
    margin: 2px 5px;
  }
  textarea.fac_inputbox {
    resize: vertical;
    font-size: 12px;
    min-height: 130px;
    width: 98%;
    background: #3d4450;
    color: #fff;
    padding: 1%;
    border: gray;
    border-radius: 5px;
  }
`);
