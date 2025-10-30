// ==UserScript==
// @name:zh-CN      Steam发送邮件工具
// @name            EmailEnhance
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.com/@chr233
// @version         1.1
// @description:zh-CN  增强发送邮件
// @description     send email enhance
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

    let mailSubject = GM_getValue("mailSubject") || "Steam curator";
    let mailContent = GM_getValue("mailContent") || "Hello, we are from the Steam curator xxxxx, here is our ... {游戏链接} {游戏名称}";

    {
        GM_registerMenuCommand("设置邮件主题", setMailSubject);
        GM_registerMenuCommand("设置邮件正文", setMailContent);

        setInterval(() => {
            const eleAs = document.querySelectorAll("a[href^='mailto']");
            if (eleAs) {
                eleAs.forEach(eleA => {
                    const mailTo = eleA.getAttribute("href")
                    eleA.textContent = "发送邮件";
                    eleA.setAttribute("href", "");
                    eleA.addEventListener("click", (e) => {
                        e.preventDefault()
                        enhanceMailTo(mailTo)
                    });
                });
            }
        }, 1000);
    }

    function setMailSubject() {
        showDialog("设置邮件主题", "支持变量：{游戏链接} {游戏名称}", mailSubject, 5000, (text) => {
            mailSubject = text;
            GM_setValue("mailSubject", text);
        });
    }

    function setMailContent() {
        showDialog("设置邮件正文", "支持变量：{游戏链接} {游戏名称}", mailContent, 5000, (text) => {
            mailContent = text;
            GM_setValue("mailContent", text);
        });
    }

    function showDialog(title, subTitle, defaultValue, length, onSuccess) {
        ShowPromptWithTextAreaDialog(title, defaultValue, "确认", "取消", length, subTitle).done((text) => onSuccess(text))
    }

    function enhanceMailTo(mailTo) {
        console.log(mailTo);

        const mail = (mailTo.match(/mailto:((?:.+)@(?:[^?\s]+))/) ?? [null, null])[1];
        if (!mail) {
            return;
        }

        const appName = document.querySelector("#application_config").getAttribute("data-appname").replace(/\\u([\dA-Fa-f]{4})/g, function (match, grp) {
            return String.fromCharCode(parseInt(grp, 16));
        });
        const encodeSubject = mailSubject.replace("{游戏链接}", location.href).replace("{游戏名称}", appName);
        const encodeContent = mailContent.replace("{游戏链接}", location.href).replace("{游戏名称}", appName);

        ShowConfirmDialog("发送邮件选项", `发送邮件到 ${mail}`, "发送邮件", "复制邮箱正文", "复制邮件标题").done((status) => {
            if (status === "OK") {
                window.open(`mailto:${mail}?subject=${encodeSubject}&body=${encodeContent}`);
            } else {
                GM_setClipboard(encodeSubject, "text");
            }
        }).fail((status) => {
            if (status) {
                GM_setClipboard(encodeContent, "text");
            }
        })
    }

})();