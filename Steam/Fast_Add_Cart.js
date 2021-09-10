// ==UserScript==
// @name         Fast_Add_Cart
// @name:zh-CN   Steam快速添加购物车
// @namespace    https://blog.chrxw.com
// @version      1.2
// @description  在商店页显示双语游戏名称，双击名称可以快捷搜索。
// @description:zh-CN  在商店页显示双语游戏名称，双击名称可以快捷搜索。
// @author       Chr_
// @include      /https://store\.steampowered\.com\/cart\/\?fac=1/
// @include      /https://store\.steampowered\.com\/search/.*/
// @require      https://greasyfork.org/scripts/431423-async-requests/code/Async_Requests.js
// @connect      store.steampowered.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// ==/UserScript==

(async () => {
    'use strict';
    if (window.location.pathname.search('cart') !== -1) {
        let subID = window.localStorage['fac_subid'];
        if (!subID) { return; }
        addToCart(subID);
    } else {
        let t = setInterval(() => {
            let container = document.getElementById('search_resultsRows');
            if (container != null) {
                clearInterval(t);
                for (let ele of container.children) {
                    addButton(ele);
                }
                container.addEventListener('DOMNodeInserted', ({ relatedNode }) => {
                    if (relatedNode.parentElement === container) {
                        addButton(relatedNode);
                    }
                });
            }
        }, 500);
    }
    //添加按钮
    function addButton(element) {

        if (element.getAttribute('added') !== null) { return; }
        element.setAttribute('added', '');

        let appID = (element.href.match(/\/app\/(\d+)/) ?? [null, null])[1];

        let btn = document.createElement('button');
        btn.addEventListener('click', async (e) => {
            chooseSubs(appID);
            e.preventDefault();
        }, false);
        btn.id = appID;
        btn.className = 'fac_btns';
        btn.textContent = '🛒';
        element.appendChild(btn);
    }

    async function chooseSubs(appID) {
        getGameSubs(appID)
            .then(async (subInfos) => {
                if (subInfos.length === 0) {
                    showAlert('错误', '<p>未找到可用SUB,添加购物车失败</p>', false);
                    return;
                } else {
                    console.log(subInfos);
                    if (subInfos.length === 1) {
                        let [subID, subName, price] = subInfos[0];
                        await addCart(subID, appID);
                        showAlert('添加购物车成功', `<p>${subName}</p>`, true);
                    } else {
                        let [subID, subName, price] = subInfos[0];
                        await addCart(subID, appID);
                        showAlert('添加购物车成功', `<p>${subName}</p>`, true);
                    }
                }

            })
            .catch(err => {
                showAlert('网络错误', `<p>${err}</p>`, false);
            });

    }
    //读取sub信息
    function getGameSubs(appID) {
        return new Promise((resolve, reject) => {
            $http.get(`https://store.steampowered.com/api/appdetails?appids=${appID}`)
                .then(json => {
                    let result = json[appID];
                    if (result.success !== true) { return; }
                    let subInfos = [];
                    for (let pkg of result.data.package_groups) {
                        for (let sub of pkg.subs) {
                            let { packageid, option_text, price_in_cents_with_discount } = sub;
                            if (price_in_cents_with_discount > 0) { //排除免费SUB
                                subInfos.push([packageid, option_text, price_in_cents_with_discount]);
                            }
                        }
                    }

                    resolve(subInfos);
                }).catch(err => {
                    reject(err);
                })
        });
    }
    //添加购物车,只支持subID
    async function addCart(subID, appID) {
        window.localStorage['fac_subid'] = subID;

        return new Promise((resolve, reject) => {

            let data = {
                action: "add_to_cart",
                originating_snr: "1_store-navigation__",
                sessionid: document.cookie.replace(/(?:(?:^|.*;\s*)sessionid\s*\=\s*([^;]*).*$)|^.*$/, "$1"),
                snr: "1_5_9__403",
                subid: String(subID),
            }
            let s = [];
            for (let k in data) {
                s+=`${k}=${encodeURIComponent(data[k])}&`;
            }
            s = s.slice(0, -1);

            fetch('https://store.steampowered.com/cart/', {
                method: 'POST',
                credentials: 'include',
                body: s,
                headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            })
                .then(res => {
                    let test = new RegExp('\<div class\=\"cart_row.*?data\-ds\-appid\=\"' + appID + '\"', 'g');
                    if (test.test(res)) {
                        console.log('添加成功');
                    }
                    else {
                        console.log('添加失败');
                    }
                    resolve();
                }).catch(err => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    //显示提示
    function showAlert(title, text, succ = true) {
        ShowAlertDialog(`${succ ? '✅' : '❌'}${title}`, text);
    }
})();

GM_addStyle(`
button.fac_btns {
    display: none;
    position: relative;
    z-index: 100;
    top: -25px;
    left: 300px;
    padding: 1px;
  }
  a.search_result_row:hover button.fac_btns {
    display: block;
  }
  
`);