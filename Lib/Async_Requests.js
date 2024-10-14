// ==UserScript==
// @name         Async_Requests
// @namespace    https://blog.chrxw.com
// @version      1.1
// @description  异步Requests库
// @author       Chr_
// ==/UserScript==

//==============================================================
class Request {
    constructor(timeout = 3000) {
        this.timeout = timeout;
    }
    get(url, opt = {}) {
        return this.baseRequest(url, 'GET', opt, 'json');
    }
    getHtml(url, opt = {}) {
        return this.baseRequest(url, 'GET', opt, '');
    }
    getText(url, opt = {}) {
        return this.baseRequest(url, 'GET', opt, 'text');
    }
    post(url, data, opt = {}) {
        opt.data = JSON.stringify(data);
        return this.baseRequest(url, 'POST', opt, 'json');
    }
    baseRequest(url, method = 'GET', opt = {}, responseType = 'json') {
        Object.assign(opt, {
            url, method, responseType, timeout: this.timeout
        });
        return new Promise((resolve, reject) => {
            opt.ontimeout = opt.onerror = reject;
            opt.onload = ({ readyState, status, response, responseText }) => {
                if (readyState === 4 && status === 200) {
                    if (responseType == 'json') {
                        resolve(response);
                    } else if (responseType == 'text') {
                        resolve(responseText);
                    }
                } else {
                    console.error('网络错误');
                    console.log(readyState);
                    console.log(status);
                    console.log(response);
                    reject('解析出错');
                }
            };
            GM_xmlhttpRequest(opt);
        });
    }
}
const $http = new Request();