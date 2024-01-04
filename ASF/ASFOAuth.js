// ==UserScript==
// @name:zh-CN      ASFOAuth自动登录
// @name            ASFOAuth
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         0.0.1
// @description     一键完成SteamOAuth登录
// @description:zh-CN  一键完成SteamOAuth登录
// @author          Chr_
// @include         http://*
// @include         https://*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_xmlhttpRequest
// @grant           GM_registerMenuCommand
// @grant           GM_addStyle
// ==/UserScript==

(() => {
    'use strict';
    const { script: { version } } = GM_info;

    let IpcHost = Gm_getValue("ipc_host");
    let IpcPass = Gm_getValue("ipc_pass") ?? "";

    GM_registerMenuCommand("ASF IPC接口设置", () => {

    });

    async function TestIpcInterface(address, password) {
        // await $http.post(address, {
    }

    class Request {
        constructor(timeout = 3000) {
            this.timeout = timeout;
        }
        get(url, opt = {}) {
            return this.baseRequest(url, 'GET', opt);
        }
        post(url, data, opt = {}) {
            opt.data = JSON.stringify(data);
            return this.baseRequest(url, 'POST', opt);
        }
        baseRequest(url, method = 'GET', opt = {}) {
            Object.assign(opt, {
                url, method, responseType, timeout: this.timeout
            });
            return new Promise((resolve, reject) => {
                opt.ontimeout = opt.onerror = reject;
                opt.onload = ({ readyState, status, response}) => {
                    if (readyState === 4 && status === 200) {
                        resolve(response);
                    } else {
                        console.error('网络错误');
                        console.log(readyState);
                        console.log(status);
                        console.log(response);
                        reject('解析出错');
                    }
                }
                GM_xmlhttpRequest(opt);
            });
        }
    }
    const $http = new Request();
})();
