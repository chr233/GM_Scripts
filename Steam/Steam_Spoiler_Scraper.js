// ==UserScript==
// @name:zh-CN      Steam隐藏内容刮刀
// @name            Steam_Spoiler_Scraper
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.3
// @description     Steam 隐藏内容刮刀
// @author          Chr_
// @match           https://steamcommunity.com/*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// ==/UserScript==

// 初始化
(() => {
    "use strict";
    addPanel();
    addFunction();

    // 添加按钮
    function addPanel() {
        function genBtn(name, foo, tooltip, id) {
            let s = document.createElement("span");
            s.className = "general_btn tooltip";
            s.title = tooltip;
            s.textContent = name;
            s.addEventListener("click", foo);
            if (id) { s.id = id; }
            return s;
        }
        let btnReport = document.getElementById("ReportItemBtn");
        if (btnReport != null) {
            let btnDiv = btnReport.parentElement;
            let btnShow = genBtn("刮开", () => { scratchAll(true); }, "刮开所有隐藏", "btnShow");
            let btnHide = genBtn("恢复", () => { scratchAll(false); }, "恢复所有隐藏", "btnHide");
            btnDiv.appendChild(btnShow);
            btnDiv.appendChild(btnHide);
        }
    }
    // 为每个隐藏绑定函数
    function addFunction() {
        for (let ele of document.querySelectorAll(".bb_spoiler")) {
            ele.addEventListener("click", scratch);
        }
    }
    // 刮开单个隐藏
    function scratch(ele) {
        let s = ele.currentTarget;
        console.log(s.getAttribute("scratch"))
        if (s.getAttribute("scratch") != "on") {
            for (let e of s.querySelectorAll("*")) {
                e.style.cssText = "visibility:visible;color:#fff;";
            }
            s.setAttribute("scratch", "on");
        } else {
            for (let e of s.querySelectorAll("*")) {
                e.style.cssText = "";
            }
            s.removeAttribute("scratch");
        }
    }
    // 刮开所有隐藏
    function scratchAll(show = true) {
        for (let ele of document.querySelectorAll(".bb_spoiler")) {
            if ((ele.getAttribute("scratch") != "on") === show) {
                ele.click();
            }
        }
    }
})();
