// ==UserScript==
// @name         Search_Steam_Store
// @namespace    https://blog.chrxw.com
// @version      1.1
// @description  搜索Steam商店,返回[{ appID, isBundle, appName, appPrice, appUrl, appImg }]
// @author       Chr_
// ==/UserScript==

//异步检索steam商店
function searchStore(keywords, cc = 'CN') {
    return new Promise((resolve, reject) => {
        $http.getText(`https://store.steampowered.com/search/suggest?term=${keywords}&f=games&cc=${cc}&realm=1&l=schinese`)
            .then((text) => {
                const vdom = document.createElement('div');
                vdom.style.display = 'none';
                vdom.innerHTML = text;
                const result = [];
                vdom.querySelectorAll('a').forEach((ele) => {
                    const isBundle = ele.hasAttribute('data-ds-bundleid');
                    const appID = parseInt(ele.getAttribute(isBundle ? 'data-ds-bundleid' : 'data-ds-appid'));
                    const appUrl = ele.getAttribute('href');
                    const appName = ele.querySelector('div.match_name').textContent;
                    const appImg = ele.querySelector('div.match_img>img').getAttribute('src');
                    const appPrice = ele.querySelector('div.match_price').textContent;
                    result.push({ appID, isBundle, appName, appPrice, appUrl, appImg });
                });
                resolve(result);
            })
            .catch((reason) => {
                console.error(reason);
                reject(reason);
            });
    });
}
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