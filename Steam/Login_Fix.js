// ==UserScript==
// @name            Login_Fix
// @name:zh-CN      修复登录框无法输入
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         1.7
// @description     修复登录框无法输入的Bug
// @description:zh-CN  修复登录框无法输入的Bug
// @author          Chr_
// @match           https://store.steampowered.com/login*
// @match           https://steamcommunity.com/openid/login*
// @match           https://steamcommunity.com/login*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// ==/UserScript==


(() => {
    "use strict";
    const userName = document.querySelector("#input_username,#steamAccountName");
    const passWord = document.querySelector("#input_password,#steamPassword");
    userName.addEventListener("dblclick", () => {
        const value = prompt("请输入用户名", userName.value);
        if (value) { userName.value = value; }
    });
    passWord.addEventListener("dblclick", () => {
        const value = prompt("请输入密码", passWord.value);
        if (value) { passWord.value = value; }
    });
})();
