// ==UserScript==
// @name:zh-CN      Steam快速添加购物车
// @name            Fast_Add_Cart
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         3.10
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
            import: "导入(正序)",
            importDesc: "从文本框批量添加购物车(从上到下导入)",
            importDesc2: "当前页面无法导入购物车",
            importReverse: "导入(倒序)",
            importDescReverse: "从文本框批量添加购物车(从下到上导入)",
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
            history: "购物车历史",
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
            import: "Import(Asc)",
            importDesc: "Batch add cart from textbox (from top to bottom)",
            importDesc2: "Current page can't import cart",
            importReverse: "Import(Desc)",
            importDescReverse: "Batch add cart from textbox (from bottom to top)",
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
    function t(key) {
        return LANG[language][key] || key;
    }
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
    }
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
    //初始化
    const pathname = window.location.pathname;
    if (
        pathname === "/search/" ||
        pathname === "/" ||
        pathname.startsWith("/tags/")
    ) {
        //搜索页,主页,标签页
        let timer = setInterval(() => {
            let containers = document.querySelectorAll(
                [
                    "#search_resultsRows",
                    "#tab_newreleases_content",
                    "#tab_topsellers_content",
                    "#tab_upcoming_content",
                    "#tab_specials_content",
                    "#NewReleasesRows",
                    "#TopSellersRows",
                    "#ConcurrentUsersRows",
                    "#TopRatedRows",
                    "#ComingSoonRows",
                ].join(",")
            );
            if (containers.length > 0) {
                for (let container of containers) {
                    clearInterval(timer);
                    for (let ele of container.children) {
                        addButton(ele);
                    }
                    container.addEventListener("DOMNodeInserted", ({ relatedNode }) => {
                        if (relatedNode.parentElement === container) {
                            addButton(relatedNode);
                        }
                    });
                }

                const searchBar = document.querySelector(".searchbar>.searchbar_left");
                if (searchBar !== null) {
                    let btn = document.createElement("button");
                    btn.addEventListener(
                        "click",
                        (e) => {
                            e.preventDefault();
                            const savedCart =
                                GM_getValue("btnv6_blue_hoverfade btn_small") ?? "";
                            const cartItems = savedCart.split("\n");
                            const regFull = new RegExp(/((app|a|bundle|b|sub|s)\/(\d+))/);
                            const regShort = new RegExp(/^(([\s]*|)(\d+))/);
                            const dataMap = new Set();

                            for (let line of cartItems) {
                                let match = line.match(regFull) ?? line.match(regShort);
                                if (match) {
                                    let [_, link, _1, _2] = match;
                                    dataMap.add(link);
                                }
                            }

                            const now = new Date().toLocaleString();
                            cartItems.push(`========【${now}】=========`);

                            const rows = document.querySelectorAll("#search_resultsRows>a");
                            for (let row of rows) {
                                if (
                                    row.className.includes("ds_owned") ||
                                    row.className.includes("ds_ignored")
                                ) {
                                    continue;
                                }

                                const url = row.href;
                                const title =
                                    row.querySelector("span.title")?.textContent ?? "null";

                                let match = url.match(regFull);
                                if (match) {
                                    let [_, link, _1, _2] = match;

                                    if (!dataMap.has(link)) {
                                        cartItems.push(`${link} #${title}`);
                                    }
                                }
                            }
                            GM_setValue("fac_cart", cartItems.join("\n"));
                            const dialog = showAlert(
                                t("batchExtractDone"),
                                t("batchDesc"),
                                true
                            );
                            setTimeout(() => {
                                dialog.Dismiss();
                            }, 1500);
                        },
                        false
                    );
                    btn.className = "btnv6_blue_hoverfade btn_small";
                    btn.innerHTML = `<span>${t("batchExtract")}</span>`;
                    searchBar.appendChild(btn);
                }
            }
        }, 500);
    } else if (
        pathname.startsWith("/publisher/") ||
        pathname.startsWith("/franchise/") ||
        pathname.startsWith("/developer/")
    ) {
        //发行商主页
        let timer = setInterval(() => {
            let container = document.getElementById("RecommendationsRows");
            if (container != null) {
                clearInterval(timer);
                for (let ele of container.querySelectorAll("a.recommendation_link")) {
                    addButton(ele);
                }
                container.addEventListener("DOMNodeInserted", ({ relatedNode }) => {
                    if (relatedNode.nodeName === "DIV") {
                        for (let ele of relatedNode.querySelectorAll(
                            "a.recommendation_link"
                        )) {
                            addButton(ele);
                        }
                    }
                });
            }
        }, 500);
    } else if (
        pathname.startsWith("/app/") ||
        pathname.startsWith("/sub/") ||
        pathname.startsWith("/bundle/")
    ) {
        //商店详情页
        let timer = setInterval(() => {
            let container = document.getElementById("game_area_purchase");
            if (container != null) {
                clearInterval(timer);
                for (let ele of container.querySelectorAll(
                    "div.game_area_purchase_game"
                )) {
                    addButton2(ele);
                }
            }
        }, 500);
    } else if (pathname.startsWith("/wishlist/")) {
        //愿望单页
        let timer = setInterval(() => {
            let container = document.getElementById("wishlist_ctn");
            if (container != null) {
                clearInterval(timer);

                for (let ele of container.querySelectorAll("div.wishlist_row")) {
                    addButton3(ele);
                }
                container.addEventListener("DOMNodeInserted", ({ relatedNode }) => {
                    if (relatedNode.nodeName === "DIV") {
                        for (let ele of relatedNode.querySelectorAll("div.wishlist_row")) {
                            addButton3(ele);
                        }
                    }
                });
            }
        }, 500);
    } else if (pathname.startsWith("/cart/")) {
        //购物车页
        const continer = document.querySelector("div.cart_area_body");

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

        const btnArea = document.createElement("div");
        const btnImport = genBtn(`🔼${t("import")}`, t("importDesc"), async () => {
            inputBox.value = await importCart(
                inputBox.value,
                false,
                chkDiscount.checked
            );
            window.location.reload();
        });
        const btnImport2 = genBtn(
            `🔼${t("importReverse")}`,
            t("importDescReverse"),
            async () => {
                inputBox.value = await importCart(
                    inputBox.value,
                    true,
                    chkDiscount.checked
                );
                window.location.reload();
            }
        );
        const histryPage = pathname.search("history") !== -1;
        if (histryPage) {
            btnImport.disabled = true;
            btnImport.title = t("importDesc2");
            btnImport2.disabled = true;
            btnImport2.title = t("importDesc2");
        }

        const [lblDiscount2, chkDiscount2] = genChk(
            t("onlyOnsale"),
            t("onlyOnsaleDesc2"),
            GM_getValue("fac_discount2") ?? false
        );

        const btnExport = genBtn(`🔽${t("export")}`, t("exportDesc"), () => {
            let currentValue = inputBox.value.trim();
            const now = new Date().toLocaleString();
            if (currentValue !== "") {
                ShowConfirmDialog(
                    "",
                    t("exportConfirm"),
                    t("exportConfirmReplace"),
                    t("exportConfirmAppend")
                )
                    .done(() => {
                        inputBox.value =
                            `========【${now}】=========\n` +
                            exportCart(chkDiscount2.checked);
                        fitInputBox();
                    })
                    .fail((bool) => {
                        if (bool) {
                            inputBox.value =
                                currentValue +
                                `\n========【${now}】=========\n` +
                                exportCart(chkDiscount2.checked);
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
                ForgetCart();
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
                    `<p>【🔼${t("importReverse")}】${t("importDescReverse")}</p>`,
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

        btnArea.appendChild(btnImport);
        btnArea.appendChild(btnImport2);
        btnArea.appendChild(lblDiscount);
        btnArea.appendChild(genSpan(" | "));
        btnArea.appendChild(btnExport);
        btnArea.appendChild(lblDiscount2);
        btnArea.appendChild(genSpan(" | "));
        btnArea.appendChild(btnHelp);

        continer.appendChild(btnArea);
        btnArea.appendChild(genBr());
        btnArea.appendChild(genBr());
        continer.appendChild(inputBox);

        const btnArea2 = document.querySelector("div.continue_shopping_ctn");
        btnArea2.innerHTML = "";

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
    }

    //始终在右上角显示购物车按钮
    const cart_btn = document.getElementById("store_header_cart_btn");
    if (cart_btn !== null) {
        cart_btn.style.display = "";
    }

    //导入购物车
    function importCart(text, reverse = false, onlyOnSale = false) {
        return new Promise(async (resolve, reject) => {
            const regFull = new RegExp(/(app|a|bundle|b|sub|s)\/(\d+)/);
            const regShort = new RegExp(/^([\s]*|)(\d+)/);
            let lines = [];

            let dialog = showAlert(
                t("importingTitle"),
                `<textarea id="fac_diag" class="fac_diag">${t("operation")}</textarea>`,
                true
            );

            let timer = setInterval(async () => {
                let txt = document.getElementById("fac_diag");
                if (txt !== null) {
                    clearInterval(timer);

                    const txts = reverse ? text.split("\n").reverse() : text.split("\n");

                    for (let line of txts) {
                        if (line.trim() === "") {
                            continue;
                        }
                        let match = line.match(regFull) ?? line.match(regShort);
                        if (!match) {
                            if (line.search("=====") === -1) {
                                let tmp = line.split("#")[0];
                                lines.push(`${tmp} #${t("formatError")}`);
                            } else {
                                lines.push(line);
                            }
                            continue;
                        }
                        let [_, type, subID] = match;
                        switch (type.toLowerCase()) {
                            case "":
                            case "a":
                            case "app":
                                type = "app";
                                break;
                            case "s":
                            case "sub":
                                type = "sub";
                                break;
                            case "b":
                            case "bundle":
                                type = "bundle";
                                break;
                            default:
                                let tmp = line.split("#")[0];
                                lines.push(`${tmp} #${t("formatError")}`);
                                continue;
                        }

                        if (type === "sub" || type === "bundle") {
                            let [succ, msg] = await addCart(type, subID, "");
                            lines.push(`${type}/${subID} #${msg}`);
                        } else {
                            try {
                                let subInfos = await getGameSubs(subID);
                                let [sID, subName, discount, price] = subInfos[0];
                                if (onlyOnSale && discount.length === 0) {
                                    lines.push(
                                        `${type}/${subID} #${subName} - ${discount}${price} ${t(
                                            "notOnSale"
                                        )}`
                                    );
                                } else {
                                    let [succ, msg] = await addCart("sub", sID, subID);
                                    lines.push(
                                        `${type}/${subID} #${subName} - ${discount}${price} ${msg}`
                                    );
                                }
                            } catch (e) {
                                lines.push(`${type}/${subID} #${t("noSubFound")}`);
                            }
                        }
                        txt.value = reverse ? lines.reverse().join("\n") : lines.join("\n");
                        txt.scrollTop = txt.scrollHeight;
                    }
                }

                dialog.Dismiss();
                resolve(lines.join("\n"));
            }, 200);
        });
    }
    //导出购物车
    function exportCart(onlyOnsale = false) {
        const regMatch = new RegExp(/(app|sub|bundle)_(\d+)/i);
        let data = [];
        for (let item of document.querySelectorAll(
            "div.cart_item_list>div.cart_row"
        )) {
            const priceEle = item.querySelector("div.cart_item_price");
            const discount = priceEle?.classList.contains("with_discount")
                ? "🔖 "
                : "";
            const price = priceEle.querySelector("div.price")?.textContent ?? "Null";

            let itemKey = item.getAttribute("data-ds-itemkey");
            let name = item.querySelector(".cart_item_desc>a").innerText.trim();
            let match = itemKey.toLowerCase().match(regMatch);
            if (match) {
                let [_, type, id] = match;

                if (onlyOnsale && discount.length === 0) {
                    continue;
                }

                data.push(`${type}/${id} #${name} ${discount}💳${price}`);
            }
        }
        return data.join("\n");
    }
    //添加按钮
    function addButton(element) {
        if (element.getAttribute("added") !== null) {
            return;
        }
        element.setAttribute("added", "");

        if (element.href === undefined) {
            return;
        }

        let appID = (element.href.match(/\/app\/(\d+)/) ?? [null, null])[1];
        if (appID === null) {
            return;
        }

        let btn = document.createElement("button");
        btn.addEventListener(
            "click",
            (e) => {
                chooseSubs(appID);
                e.preventDefault();
            },
            false
        );
        btn.className = "fac_listbtns";
        btn.textContent = "🛒";
        element.appendChild(btn);
    }
    //添加按钮
    function addButton2(element) {
        if (element.getAttribute("added") !== null) {
            return;
        }
        element.setAttribute("added", "");
        let type, subID;

        let parentElement = element.parentElement;

        if (parentElement.hasAttribute("data-ds-itemkey")) {
            let itemKey = parentElement.getAttribute("data-ds-itemkey");
            let match = itemKey.toLowerCase().match(/(app|sub|bundle)_(\d+)/);
            if (match) {
                [, type, subID] = match;
            }
        } else if (
            parentElement.hasAttribute("data-ds-bundleid") ||
            parentElement.hasAttribute("data-ds-subid")
        ) {
            subID =
                parentElement.getAttribute("data-ds-subid") ??
                parentElement.getAttribute("data-ds-bundleid");
            type = parentElement.hasAttribute("data-ds-subid") ? "sub" : "bundle";
        } else {
            let match = element.id.match(/cart_(\d+)/);
            if (match) {
                type = "sub";
                [, subID] = match;
            }
        }

        if (type === undefined || subID === undefined) {
            console.warn(t("addCartErrorSubNotFount"));
            return;
        }

        const btnBar = element.querySelector("div.game_purchase_action");
        const firstItem = element.querySelector("div.game_purchase_action_bg");
        if (
            btnBar === null ||
            firstItem == null ||
            type === undefined ||
            subID === undefined
        ) {
            return;
        }
        let appID = (window.location.pathname.match(/\/(app)\/(\d+)/) ?? [
            null,
            null,
            null,
        ])[2];
        let btn = document.createElement("button");
        btn.addEventListener(
            "click",
            async () => {
                let dialog = showAlert(
                    t("operation"),
                    `<p>${t("addCartTips")}</p>`,
                    true
                );
                let [succ, msg] = await addCart(type, subID, appID);
                let done = showAlert(t("operationDone"), `<p>${msg}</p>`, succ);
                setTimeout(() => {
                    done.Dismiss();
                }, 1200);
                dialog.Dismiss();
                if (succ) {
                    let acBtn = btnBar.querySelector("div[class='btn_addtocart']>a");
                    if (acBtn) {
                        acBtn.href = "https://store.steampowered.com/cart/";
                        acBtn.innerHTML = `\n\t\n<span>${t("inCart")}</span>\n\t\n`;
                    }
                }
            },
            false
        );
        btn.className = "fac_listbtns";
        btn.textContent = "🛒";
        btnBar.insertBefore(btn, firstItem);
    }
    //添加按钮
    function addButton3(element) {
        if (element.getAttribute("added") !== null) {
            return;
        }
        element.setAttribute("added", "");

        let appID = element.getAttribute("data-app-id");
        if (appID === null) {
            return;
        }

        let btn = document.createElement("button");
        btn.addEventListener(
            "click",
            (e) => {
                chooseSubs(appID);
                e.preventDefault();
            },
            false
        );
        btn.className = "fac_listbtns";
        btn.textContent = "🛒";
        element.appendChild(btn);
    }
    //选择SUB
    async function chooseSubs(appID) {
        let dialog = showAlert(t("operation"), `<p>${t("fetchingSubs")}</p>`, true);
        getGameSubs(appID)
            .then(async (subInfos) => {
                if (subInfos.length === 0) {
                    showAlert(
                        t("addCartError"),
                        `<p>${t("noSubFound")}, ${t("noSubDesc")}.</p>`,
                        false
                    );
                    dialog.Dismiss();
                    return;
                } else {
                    if (subInfos.length === 1) {
                        let [subID, subName, discount, price] = subInfos[0];
                        await addCart("sub", subID, appID);
                        let done = showAlert(
                            t("addCartSuccess"),
                            `<p>${subName} - ${discount}${price}</p>`,
                            true
                        );
                        setTimeout(() => {
                            done.Dismiss();
                        }, 1200);
                        dialog.Dismiss();
                    } else {
                        let dialog2 = showAlert(
                            t("chooseSub"),
                            "<div id=fac_choose></div>",
                            true
                        );
                        dialog.Dismiss();
                        await new Promise((resolve) => {
                            let timer = setInterval(() => {
                                if (document.getElementById("fac_choose") !== null) {
                                    clearInterval(timer);
                                    resolve();
                                }
                            }, 200);
                        });
                        let divContiner = document.getElementById("fac_choose");
                        for (let [subID, subName, discount, price] of subInfos) {
                            let btn = document.createElement("button");
                            btn.addEventListener("click", async () => {
                                let dialog = showAlert(
                                    t("operation"),
                                    `<p>${t("add")} ${subName} - ${discount}${price} ${t(
                                        "toCart"
                                    )}</p>`,
                                    true
                                );
                                dialog2.Dismiss();
                                let [succ, msg] = await addCart("sub", subID, appID);
                                let done = showAlert(
                                    msg,
                                    `<p>${subName} - ${discount}${price}</p>`,
                                    succ
                                );
                                setTimeout(() => {
                                    done.Dismiss();
                                }, 1200);
                                dialog.Dismiss();
                            });
                            btn.textContent = `🛒${t("addCart")}`;
                            btn.className = "fac_choose";
                            let p = document.createElement("p");
                            p.textContent = `${subName} - ${discount}${price}`;
                            p.appendChild(btn);
                            divContiner.appendChild(p);
                        }
                    }
                }
            })
            .catch((err) => {
                let done = showAlert(t("networkError"), `<p>${err}</p>`, false);
                setTimeout(() => {
                    done.Dismiss();
                }, 2000);
                dialog.Dismiss();
            });
    }
    //读取sub信息
    function getGameSubs(appID) {
        return new Promise((resolve, reject) => {
            const regPure = new RegExp(/ - [^-]*$/, "");
            const regSymbol = new RegExp(/[>-] ([^>-]+) [\d.]+$/, "");
            const lang = document.cookie.replace(
                /(?:(?:^|.*;\s*)Steam_Language\s*\=\s*([^;]*).*$)|^.*$/,
                "$1"
            );
            fetch(
                `https://store.steampowered.com/api/appdetails?appids=${appID}&lang=${lang}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            )
                .then(async (response) => {
                    if (response.ok) {
                        let data = await response.json();
                        let result = data[appID];
                        if (result.success !== true) {
                            reject(t("unrecognizedResult"));
                        }
                        let subInfos = [];
                        for (let pkg of result.data.package_groups) {
                            for (let sub of pkg.subs) {
                                const {
                                    packageid,
                                    option_text,
                                    percent_savings_text,
                                    price_in_cents_with_discount,
                                } = sub;
                                if (price_in_cents_with_discount > 0 && !option_text.includes("Commercial License")) {
                                    //排除免费SUB 以及商业许可
                                    const symbol = option_text.match(regSymbol)?.pop();
                                    const subName = option_text.replace(regPure, "");
                                    const price =
                                        "💳" + price_in_cents_with_discount / 100 + " " + symbol;
                                    const discount =
                                        percent_savings_text !== " "
                                            ? "🔖" + percent_savings_text + " "
                                            : "";
                                    subInfos.push([packageid, subName, discount, price]);
                                }
                            }
                        }
                        console.info(subInfos);
                        resolve(subInfos);
                    } else {
                        reject(t("networkRequestError"));
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
    //添加购物车,只支持subID和bundleID
    function addCart(type = "sub", subID, appID = null) {
        window.localStorage["fac_subid"] = subID;
        return new Promise((resolve, reject) => {
            let data = {
                action: "add_to_cart",
                originating_snr: "1_store-navigation__",
                sessionid: document.cookie.replace(
                    /(?:(?:^|.*;\s*)sessionid\s*\=\s*([^;]*).*$)|^.*$/,
                    "$1"
                ),
                snr: "1_5_9__403",
            };
            data[`${type}id`] = String(subID);
            let s = "";
            for (let k in data) {
                s += `${k}=${encodeURIComponent(data[k])}&`;
            }
            fetch("https://store.steampowered.com/cart/", {
                method: "POST",
                credentials: "include",
                body: s,
                headers: {
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                },
            })
                .then(async (response) => {
                    if (response.ok) {
                        let data = await response.text();
                        if (appID !== null) {
                            const regIfSucc = new RegExp("app/" + appID);
                            if (data.search(regIfSucc) !== -1) {
                                resolve([true, t("addCartSuccess")]);
                            } else {
                                resolve([false, t("addCartError")]);
                            }
                        } else {
                            resolve([true, t("addCartSuccess")]);
                        }
                    } else {
                        resolve([false, t("networkRequestError")]);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    resolve([false, `${t("unknownError")}: ${err}`]);
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
        padding: 5px 10px;
    }
    button.fac_cartbtns:not(:last-child) {
        margin-right: 5px;
    }
    button.fac_cartbtns:not(:first-child) {
        margin-left: 5px;
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
        height: 130px;
        resize: vertical;
        font-size: 10px;
        min-height: 130px;
    }
    textarea.fac_diag {
        height: 150px;
        width: 600px;
        resize: vertical;
        font-size: 10px;
        margin-bottom: 5px;
        padding: 5px;
        background-color: rgba(0, 0, 0, 0.4);
        color: #fff;
        border: 1 px solid #000;
        border-radius: 3 px;
        box-shadow: 1px 1px 0px #45556c;
    } 
    `);
