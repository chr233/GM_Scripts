// ==UserScript==
// @name         Fast_Add_Cart
// @name:zh-CN   Steam快速添加购物车
// @namespace    https://blog.chrxw.com
// @version      1.7
// @description  在商店页显示双语游戏名称，双击名称可以快捷搜索。
// @description:zh-CN  在商店页显示双语游戏名称，双击名称可以快捷搜索。
// @author       Chr_
// @include      /https://store\.steampowered\.com\/search/.*/
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_addStyle
// ==/UserScript==

(async () => {
    'use strict';
    //初始化
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
            window.addCartEx = addCart;
        }
    }, 500);

    //添加按钮
    function addButton(element) {
        if (element.getAttribute('added') !== null) { return; }
        element.setAttribute('added', '');

        let appID = (element.href.match(/\/app\/(\d+)/) ?? [null, null])[1];

        if (appID == null) { return; }

        let btn = document.createElement('button');
        btn.addEventListener('click', async (e) => {
            chooseSubs(appID);
            e.preventDefault();
        }, false);
        btn.id = appID;
        btn.className = 'fac_listbtns';
        btn.textContent = '🛒';
        element.appendChild(btn);
    }
    //列表按钮点击
    async function chooseSubs(appID) {
        let dialog = showAlert('操作中……', '<p>读取可用SUB</p>', true);
        getGameSubs(appID)
            .then(async (subInfos) => {
                if (subInfos.length === 0) {
                    showAlert('添加购物车失败', '<p>未找到可用SUB, 可能尚未发行或者是免费游戏.</p>', false);
                    return;
                } else {
                    console.log(subInfos);
                    if (subInfos.length === 1) {
                        let [subID, subName] = subInfos[0];
                        await addCart(subID, appID);
                        let done = showAlert('添加购物车成功', `<p>${subName}</p>`, true);
                        setTimeout(() => { done.Dismiss(); }, 1200);
                        dialog.Dismiss();
                    } else {
                        let dialog2 = showAlert('请选择SUB', '<div id=fac_choose></div>', true);
                        dialog.Dismiss();
                        await new Promise((resolve) => {
                            let t = setInterval(() => {
                                if (document.getElementById('fac_choose') !== null) {
                                    clearInterval(t);
                                    resolve();
                                }
                            }, 200);
                        });
                        let divContiner = document.getElementById('fac_choose');
                        for (let [subID, subName] of subInfos) {
                            let btn = document.createElement('button');
                            btn.addEventListener('click', async () => {
                                let dialog = showAlert('操作中……', `<p>添加 ${subName} 到购物车</p>`, true);
                                dialog2.Dismiss();
                                let [succ, msg] = await addCart(subID, appID);
                                let done = showAlert(msg, `<p>${subName}</p>`, succ);
                                setTimeout(() => { done.Dismiss(); }, 1200);
                                dialog.Dismiss();
                            });
                            btn.textContent = '🛒添加购物车';
                            btn.className = 'fac_choose';
                            let p = document.createElement('p');
                            p.textContent = subName;
                            p.appendChild(btn);
                            divContiner.appendChild(p);
                        }
                    }
                }

            })
            .catch(err => {
                let done = showAlert('网络错误', `<p>${err}</p>`, false);
                setTimeout(() => { done.Dismiss(); }, 2000);
                dialog.Dismiss();
            });
    }
    //读取sub信息
    function getGameSubs(appID) {
        return new Promise((resolve, reject) => {
            let lang = document.cookie.replace(/(?:(?:^|.*;\s*)Steam_Language\s*\=\s*([^;]*).*$)|^.*$/, "$1")
            fetch(`https://store.steampowered.com/api/appdetails?appids=${appID}&lang=${lang}`, {
                method: 'GET',
                credentials: 'include',
            })
                .then(async response => {
                    if (response.ok) {
                        let data = await response.json();
                        let result = data[appID];
                        if (result.success !== true) {
                            reject('返回了未知结果');
                        }
                        let subInfos = [];
                        for (let pkg of result.data.package_groups) {
                            for (let sub of pkg.subs) {
                                let { packageid, option_text, price_in_cents_with_discount } = sub;
                                if (price_in_cents_with_discount > 0) { //排除免费SUB
                                    subInfos.push([packageid, option_text]);
                                }
                            }
                        }
                        resolve(subInfos);
                    } else {
                        reject('网络请求失败');
                    }
                }).catch(err => {
                    reject(err);
                });
        });
    }
    //添加购物车,只支持subID
    function addCart(subID, appID) {
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
                s += `${k}=${encodeURIComponent(data[k])}&`;
            }
            fetch('https://store.steampowered.com/cart/', {
                method: 'POST',
                credentials: 'include',
                body: s,
                headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            })
                .then(async response => {
                    if (response.ok) {
                        let data = await response.text();
                        let reg = new RegExp('app\/' + appID);
                        if (data.search(reg) !== -1) {
                            resolve([true, '添加购物车成功']);
                        }
                        else {
                            resolve([false, '添加购物车失败']);
                        }
                    } else {
                        resolve([false, '网络请求失败']);
                    }
                }).catch(err => {
                    console.error(err);
                    resolve([false, '未知错误：' + err]);
                });
        });
    }
    //显示提示
    function showAlert(title, text, succ = true) {
        return ShowAlertDialog(`${succ ? '✅' : '❌'}${title}`, text);
    }
})();

GM_addStyle(`
button.fac_listbtns {
    display: none;
    position: relative;
    z-index: 100;
    top: -25px;
    left: 300px;
    padding: 1px;
  }
  a.search_result_row:hover button.fac_listbtns {
    display: block;
  }
  button.fac_choose {
    padding: 1px;
    margin: 2px 5px;
  }
`);