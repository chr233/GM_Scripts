// ==UserScript==
// @name:zh-CN            Steam 动态批量点赞
// @name                  Steam_Zoom_Like
// @namespace             https://blog.chrxw.com
// @supportURL            https://blog.chrxw.com/scripts.html
// @contributionURL       https://afdian.com/@chr233
// @version               1.8
// @description:zh-CN     批量点赞Steam动态朋友圈, 原作者 Garen
// @description           批量点赞Steam动态朋友圈, 原作者 Garen
// @author                Garen, Chr_
// @license               AGPL-3.0
// @icon                  https://blog.chrxw.com/favicon.ico
// @match                 https://steamcommunity.com/id/*/home*
// @match                 https://steamcommunity.com/profiles/*/home*
// @grant                 GM_addStyle
// @grant                 GM_registerMenuCommand
// ==/UserScript==

// 原版脚本: https://greasyfork.org/zh-CN/scripts/379844

(function () {
    'use strict';

    // 获取添加按钮的父元素
    const titleArea = document.querySelector('div.blotter_page_title');

    // 创新点赞按钮
    const btnArea = document.createElement("div");
    btnArea.className = "panel_szl";
    titleArea.appendChild(btnArea);

    const chkReview = genChk("评测", "发布评测", "szl_chk_review", btnArea);
    const chkPurchase = genChk("购买", "购买新游戏", "szl_chk_purchase", btnArea);
    const chkScreenshot = genChk("截图", "上传截图", "szl_chk_image", btnArea);
    const chkUserstatus = genChk("状态", "用户状态", "szl_chk_userstatus", btnArea);
    const chkOther = genChk("其它", "艺术作品, 指南, 创意工坊, 其它", "szl_chk_other", btnArea);
    const btnLike = genBtn("开始点赞", "btn_szl", startLike, btnArea);

    let t = 0;
    let autoStart = localStorage.getItem("szl_auto") === "true";

    function startLike() {
        if (t === 0) {
            btnLike.textContent = "停止点赞";
            t = setInterval(() => {
                const elemets = document.querySelectorAll("div.blotter_day>div.blotter_block>div[class]:not([like])");
                for (let ele of elemets) {
                    const clsName = ele.className;
                    let a = undefined;

                    if (chkReview.checked && clsName === "blotter_recommendation") {
                        a = ele.querySelector("div.control_block>a[onclick^='UserReviewVoteUp']:not(.btn_active)");
                    } else if (
                        (chkPurchase.checked && clsName === "blotter_gamepurchase") ||
                        (chkScreenshot.checked && clsName === "blotter_screenshot") ||
                        (chkUserstatus.checked && clsName === "blotter_userstatus") ||
                        (chkOther.checked && clsName !== "blotter_gamepurchase" && clsName !== "blotter_screenshot" && clsName !== "blotter_userstatus")
                    ) {
                        a = ele.querySelector("div.blotter_control_container>a[id^='vote_up']:not(.active)");
                    }

                    if (a) {
                        ele.setAttribute("like", "");
                        a.click();
                        break;
                    }
                }
            }, 100);
        } else {
            btnLike.textContent = "开始点赞";
            clearInterval(t);
            t = 0;
        }
    }

    GM_registerMenuCommand(autoStart ? "自动开始点赞 [开]" : "自动开始点赞 [关]", () => {
        autoStart = !autoStart;
        localStorage.setItem("szl_auto", autoStart);
        ShowAlertDialog("提示", "设置已保存, 刷新页面后生效");
        if (!autoStart && t > 0) {
            startLike();
        }
    });

    if (autoStart) {
        startLike();
    }

    function genChk(name, title, key, parent) {
        const d = document.createElement("div");
        const l = document.createElement("label");
        const i = document.createElement("input");
        d.className = "container_szl";
        i.textContent = name;
        i.title = title;
        i.type = "checkbox";
        i.id = key;
        i.checked = localStorage.getItem(key) === "true";
        i.addEventListener('change', () => { localStorage.setItem(key, i.checked); });
        l.title = title;
        l.textContent = name;
        l.setAttribute("for", key);
        d.appendChild(i);
        d.appendChild(l);
        parent.appendChild(d);
        return i;
    }
    function genBtn(name, cls, func, parent) {
        const b = document.createElement("button");
        b.textContent = name;
        b.className = cls;
        b.addEventListener("click", func);
        parent.appendChild(b);
        return b;
    }
})();

GM_addStyle(`
div.panel_szl {
    float: right;
    margin-right: 2%;
    margin-top: -2%;
    display: inline-flex;
}
div.panel_szl > * {
    margin-left: 6px;
}
div.container_szl {
    align-items: center;
    display: flex;
}
button.btn_szl {
    width: 75px;
    border-radius: 2px;
    border: none;
    padding: 1px;
    display: inline-block;
    cursor: pointer;
    text-decoration: none !important;
    color: #fff !important;
    background: #acb5bd;
    background: -webkit-linear-gradient(top, #acb5bd 5%, #414a52 95%);
    background: linear-gradient(to bottom, #acb5bd 5%, #414a52 95%);
}
`);