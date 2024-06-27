// ==UserScript==
// @name:zh-CN      DIG批量回收
// @name            Fast_Trade_In
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.1
// @description     优化回收流程
// @description:zh-CN  添加删除按钮
// @author          Chr_
// @include         https://www.dailyindiegame.com/account_*.html
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_addStyle
// ==/UserScript==

// 初始化
(() => {
    "use strict";

    initPanel();

    function initPanel() {
        function genChk(name, title, checked = false) {
            const l = document.createElement("label");
            const i = document.createElement("input");
            const s = document.createElement("span");
            s.textContent = name;
            i.title = title;
            i.type = "checkbox";
            i.checked = checked;
            l.title = title;
            l.className = "fti_chk";
            l.appendChild(i);
            l.appendChild(s);
            return [l, i];
        }
        function genBtn(text, title, onclick) {
            let btn = document.createElement("button");
            btn.textContent = text;
            btn.title = title;
            btn.className = "fti_btn";
            btn.addEventListener("click", onclick);
            return btn;
        }

        const [lblAlert, chkAlert] = genChk("直接回收", "回收前是否弹出提示框", false);
        const btnAllTradeIn = genBtn("全部回收", "回收所有选中的游戏", doTradeIn);

        const tradeInLinks = document.querySelectorAll("a[href^='account_buyback']");
        for (let link of tradeInLinks) {
            const href = link.href;
            link.href = "#";
            link.data = href;

            link.addEventListener("click", async (e) => {
                e.preventDefault();

                if (!chkAlert.checked && !confirm("确定要回收吗？")) {
                    return;
                }

                const result = await makeTradeIn(href);
                if (result === 200) {
                    link.style.textDecoration = "line-through";
                    link.disabled = true;
                }
            });
        }

        async function doTradeIn() {
            if (!chkAlert.checked && !confirm("确定要回收吗？")) {
                return;
            }

            for (let link of tradeInLinks) {
                if (link.disabled) {
                    continue;
                }

                const result = await makeTradeIn(link.data);
                if (result === 200) {
                    link.style.textDecoration = "line-through";
                    link.disabled = true;
                }
            }
        }

        if (tradeInLinks.length > 0) {
            document.body.appendChild(lblAlert);
            document.body.appendChild(btnAllTradeIn);
        }
    }

    function makeTradeIn(url) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: "POST",
                credentials: "include",
                data: "send=Trade KEY",
            })
                .then(async (response) => {
                    if (response.ok) {
                        const text = await response.text();
                        resolve(200);
                    } else {
                        resolve(response.status);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    resolve(-1);
                });
        });
    }
})();

GM_addStyle(`
  .fti_chk {
    color: orange;
  }
`);
