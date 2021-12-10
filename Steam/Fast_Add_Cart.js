// ==UserScript==
// @name:zh-CN      Steam快速添加购物车
// @name            Fast_Add_Cart
// @namespace       https://blog.chrxw.com
// @supportURL      https://blog.chrxw.com/scripts.html
// @contributionURL https://afdian.net/@chr233
// @version         2.23
// @description     超级方便的添加购物车体验，不用跳转商店页。
// @description:zh-CN  超级方便的添加购物车体验，不用跳转商店页。
// @author          Chr_
// @match           https://store.steampowered.com/*
// @license         AGPL-3.0
// @icon            https://blog.chrxw.com/favicon.ico
// @grant           GM_addStyle
// @grant           GM_setClipboard
// @grant           GM_setValue
// @grant           GM_getValue
// ==/UserScript==

(async () => {
    'use strict';
    //初始化
    const pathname = window.location.pathname;
    if (pathname === '/search/' || pathname === '/' || pathname.startsWith('/tags/')) { //搜索页,主页,标签页
        let t = setInterval(() => {
            let containers = document.querySelectorAll([
                '#search_resultsRows',
                '#tab_newreleases_content',
                '#tab_topsellers_content',
                '#tab_upcoming_content',
                '#tab_specials_content',
                '#NewReleasesRows',
                '#TopSellersRows',
                '#ConcurrentUsersRows',
                '#TopRatedRows',
                '#ComingSoonRows'
            ].join(','));
            if (containers.length > 0) {
                for (let container of containers) {
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
            }
        }, 500);
    } else if (pathname.startsWith('/publisher/') || pathname.startsWith('/franchise/')) { //发行商主页
        let t = setInterval(() => {
            let container = document.getElementById('RecommendationsRows');
            if (container != null) {
                clearInterval(t);
                for (let ele of container.querySelectorAll('a.recommendation_link')) {
                    addButton(ele);
                }
                container.addEventListener('DOMNodeInserted', ({ relatedNode }) => {
                    if (relatedNode.nodeName === 'DIV') {
                        for (let ele of relatedNode.querySelectorAll('a.recommendation_link')) {
                            addButton(ele);
                        }
                    }
                });
            }
        }, 500);
    } else if (pathname.startsWith('/app/') || pathname.startsWith('/sub/') || pathname.startsWith('/bundle/')) { //商店详情页
        let t = setInterval(() => {
            let container = document.getElementById('game_area_purchase');
            if (container != null) {
                clearInterval(t);
                for (let ele of container.querySelectorAll('div.game_area_purchase_game')) {
                    addButton2(ele);
                }
            }
        }, 500);
    } else if (pathname.startsWith('/wishlist/')) { //愿望单页
        let t = setInterval(() => {
            let container = document.getElementById('wishlist_ctn');
            if (container != null) {
                clearInterval(t);

                for (let ele of container.querySelectorAll('div.wishlist_row')) {
                    addButton3(ele);
                }
                container.addEventListener('DOMNodeInserted', ({ relatedNode }) => {
                    if (relatedNode.nodeName === 'DIV') {
                        for (let ele of relatedNode.querySelectorAll('div.wishlist_row')) {
                            addButton3(ele);
                        }
                    }
                });
            }
        }, 500);
    } else if (pathname === '/cart/') { //购物车页
        let continer = document.querySelector('div.cart_area_body');

        let genBr = () => { return document.createElement('br'); };
        let genBtn = (text, title, onclick) => {
            let btn = document.createElement('button');
            btn.textContent = text;
            btn.title = title;
            btn.className = 'btn_medium btnv6_blue_hoverfade fac_cartbtns';
            btn.addEventListener('click', onclick);
            return btn;
        };
        let genSpan = (text) => {
            let span = document.createElement('span');
            span.textContent = text;
            return span;
        };
        let inputBox = document.createElement('textarea');
        inputBox.value = GM_getValue('fac_cart') ?? '';
        inputBox.className = 'fac_inputbox';
        inputBox.placeholder = ['一行一条, 自动忽略【#】后面的内容, 支持的格式如下: (自动保存)',
            '1. 商店链接: https://store.steampowered.com/app/xxx',
            '2. DB链接:  https://steamdb.info/app/xxx',
            '3. appID:   xxx a/xxx app/xxx',
            '4. subID:       s/xxx sub/xxx',
            '5. bundleID:    b/xxx bundle/xxx'
        ].join('\n');

        let btnArea = document.createElement('div');
        let btnImport = genBtn('🔼批量导入', '从文本框批量添加购物车', async () => {
            inputBox.value = await importCart(inputBox.value);
            window.location.reload();
        });
        let btnExport = genBtn('🔽导出', '将购物车内容导出至文本框', () => {
            let currentValue = inputBox.value.trim();
            if (currentValue !== '') {
                ShowConfirmDialog('', '输入框中含有内容, 请选择操作?', '覆盖原有内容', '添加到最后')
                    .done(() => {
                        inputBox.value = exportCart();
                    })
                    .fail(() => {
                        inputBox.value = currentValue + '\n' + exportCart()
                    })
            } else {
                inputBox.value = exportCart();
            }
        });
        let btnCopy = genBtn('📋复制', '复制文本框中的内容', () => {
            GM_setClipboard(inputBox.value, 'text');;
            showAlert('提示', '复制到剪贴板成功', true);
        });
        let btnClear = genBtn('🗑️清除', '清除文本框和已保存的数据', () => {
            ShowConfirmDialog('', '您确定要清除文本框和已保存的数据吗？', '是', '否')
                .done(() => {
                    inputBox.value = '';
                    GM_setValue('fac_cart', '');
                    showAlert('提示', '文本框内容和保存的数据已清除', true);
                });
        });
        let btnForget = genBtn('⚠️清空', '清空购物车', () => {
            ShowConfirmDialog('', '您确定要移除所有您购物车中的物品吗？', '是', '否')
                .done(() => {
                    ForgetCart();
                    window.location.reload();
                });
        });
        let btnHelp = genBtn('🔣帮助', '显示帮助', () => {
            const { script: { version } } = GM_info;
            showAlert(`帮助 插件版本 ${version}`, [
                '<p>【🔼批量导入】从文本框批量添加购物车。</p>',
                '<p>【🔽导出】将购物车内容导出至文本框。</p>',
                '<p>【📋复制】复制文本框中的内容(废话)。</p>',
                '<p>【🗑️清除】清除文本框和已保存的数据。</p>',
                '<p>【⚠️清空】清空购物车。</p>',
                '<p>【🔣帮助】显示没什么卵用的帮助。</p>',
                '<p>【<a href=https://keylol.com/t747892-1-1 target="_blank">发布帖</a>】 【<a href=https://blog.chrxw.com/scripts.html target="_blank">脚本反馈</a>】 【Developed by <a href=https://steamcommunity.com/id/Chr_>Chr_</a>】</p>'
            ].join('<br>'), true)
        });

        btnArea.appendChild(btnImport);
        btnArea.appendChild(btnExport);
        btnArea.appendChild(genSpan(' | '));
        btnArea.appendChild(btnCopy);
        btnArea.appendChild(btnClear);
        btnArea.appendChild(genSpan(' | '));
        btnArea.appendChild(btnForget);
        btnArea.appendChild(genSpan(' | '));
        btnArea.appendChild(btnHelp);

        continer.appendChild(btnArea);
        btnArea.appendChild(genBr());
        btnArea.appendChild(genBr());
        continer.appendChild(inputBox);

        window.addEventListener('beforeunload', () => { GM_setValue('fac_cart', inputBox.value); })
    }

    //始终在右上角显示购物车按钮
    let cart_btn = document.getElementById('store_header_cart_btn');
    if (cart_btn !== null) { cart_btn.style.display = ''; }

    //导入购物车
    function importCart(text) {
        return new Promise(async (resolve, reject) => {
            const regFull = new RegExp(/(app|a|bundle|b|sub|s)\/(\d+)/);
            const regShort = new RegExp(/()(\d+)/);
            let lines = [];

            let dialog = showAlert('正在导入购物车……', '<textarea id="fac_diag" class="fac_diag">操作中……</textarea>', true);

            let t = setInterval(async () => {
                let txt = document.getElementById('fac_diag');
                if (txt !== null) {
                    clearInterval(t);
                    for (let line of text.split('\n')) {
                        if (line.trim() === '') {
                            continue;
                        }
                        let match = line.match(regFull) ?? line.match(regShort);
                        if (!match) {
                            let tmp = line.split('#')[0];
                            lines.push(`${tmp} #格式有误`);
                            continue;
                        }
                        let [_, type, subID] = match;
                        switch (type.toLowerCase()) {
                            case '':
                            case 'a':
                            case 'app':
                                type = 'app';
                                break;
                            case 's':
                            case 'sub':
                                type = 'sub';
                                break;
                            case 'b':
                            case 'bundle':
                                type = 'bundle';
                                break;
                            default:
                                let tmp = line.split('#')[0];
                                lines.push(`${tmp} #格式有误`);
                                continue;
                        }

                        if (type === 'sub' || type === 'bundle') {
                            let [succ, msg] = await addCart(type, subID, '');
                            lines.push(`${type}/${subID} #${msg}`);
                        } else {
                            try {
                                let subInfos = await getGameSubs(subID);
                                let [sID, subName, discount, price] = subInfos[0];
                                let [succ, msg] = await addCart('sub', sID, subID);
                                lines.push(`${type}/${subID} #${subName} - ${discount}${price} ${msg}`);
                            } catch (e) {
                                lines.push(`${type}/${subID} #未找到可用SUB`);
                            }
                        }
                        txt.value = lines.join('\n');
                        txt.scrollTop = txt.scrollHeight;
                    }
                }

                dialog.Dismiss();
                resolve(lines.join('\n'));
            }, 200);
        });
    }
    //导出购物车
    function exportCart() {
        const regMatch = new RegExp(/(app|sub|bundle)_(\d+)/);
        let data = [];
        for (let item of document.querySelectorAll('div.cart_item_list>div.cart_row ')) {
            let itemKey = item.getAttribute('data-ds-itemkey');
            let name = item.querySelector('.cart_item_desc>a').innerText.trim();
            let match = itemKey.toLowerCase().match(regMatch);
            if (match) {
                let [_, type, id] = match;
                data.push(`${type}/${id} #${name}`);
            }
        }
        return data.join('\n');
    }
    //添加按钮
    function addButton(element) {
        if (element.getAttribute('added') !== null) { return; }
        element.setAttribute('added', '');

        if (element.href === undefined) { return; }

        let appID = (element.href.match(/\/app\/(\d+)/) ?? [null, null])[1];
        if (appID === null) { return; }

        let btn = document.createElement('button');
        btn.addEventListener('click', (e) => {
            chooseSubs(appID);
            e.preventDefault();
        }, false);
        btn.className = 'fac_listbtns';
        btn.textContent = '🛒';
        element.appendChild(btn);
    }
    //添加按钮
    function addButton2(element) {
        if (element.getAttribute('added') !== null) { return; }
        element.setAttribute('added', '');
        let type, subID;

        let parentElement = element.parentElement;

        if (parentElement.hasAttribute('data-ds-itemkey')) {
            let itemKey = parentElement.getAttribute('data-ds-itemkey');
            let match = itemKey.toLowerCase().match(/(app|sub|bundle)_(\d+)/);
            if (match) { [, type, subID] = match; }
        } else if (parentElement.hasAttribute('data-ds-bundleid') || parentElement.hasAttribute('data-ds-subid')) {
            subID = parentElement.getAttribute('data-ds-subid') ?? parentElement.getAttribute('data-ds-bundleid');
            type = parentElement.hasAttribute('data-ds-subid') ? 'sub' : 'bundle';
        } else {
            let match = element.id.match(/cart_(\d+)/);
            if (match) {
                type = 'sub';
                [, subID] = match;
            }
        }

        if (type === undefined || subID === undefined) { console.log('未识别到subID'); return; }

        const btnBar = element.querySelector('div.game_purchase_action');
        const firstItem = element.querySelector('div.game_purchase_action_bg');
        if (btnBar === null || firstItem == null || type === undefined || subID === undefined) { return; }
        let appID = (window.location.pathname.match(/\/(app)\/(\d+)/) ?? [null, null, null])[2];
        let btn = document.createElement('button');
        btn.addEventListener('click', async () => {
            let dialog = showAlert('操作中……', '<p>添加到购物车……</p>', true);
            let [succ, msg] = await addCart(type, subID, appID);
            let done = showAlert('操作完成', `<p>${msg}</p>`, succ);
            setTimeout(() => { done.Dismiss(); }, 1200);
            dialog.Dismiss();
            if (succ) {
                let acBtn = btnBar.querySelector('div[class="btn_addtocart"]>a');
                if (acBtn) {
                    acBtn.href = 'https://store.steampowered.com/cart/';
                    acBtn.innerHTML = '\n\t\n<span>在购物车中</span>\n\t\n';
                }
            }
        }, false);
        btn.className = 'fac_listbtns';
        btn.textContent = '🛒';
        btnBar.insertBefore(btn, firstItem);
    }
    //添加按钮
    function addButton3(element) {
        if (element.getAttribute('added') !== null) { return; }
        element.setAttribute('added', '');

        let appID = element.getAttribute('data-app-id');
        if (appID === null) { return; }

        let btn = document.createElement('button');
        btn.addEventListener('click', (e) => {
            chooseSubs(appID);
            e.preventDefault();
        }, false);
        btn.className = 'fac_listbtns';
        btn.textContent = '🛒';
        element.appendChild(btn);
    }
    //选择SUB
    async function chooseSubs(appID) {
        let dialog = showAlert('操作中……', '<p>读取可用SUB</p>', true);
        getGameSubs(appID)
            .then(async (subInfos) => {
                if (subInfos.length === 0) {
                    showAlert('添加购物车失败', '<p>未找到可用SUB, 可能尚未发行或者是免费游戏.</p>', false);
                    dialog.Dismiss();
                    return;
                } else {
                    if (subInfos.length === 1) {
                        let [subID, subName, discount, price] = subInfos[0];
                        await addCart('sub', subID, appID);
                        let done = showAlert('添加购物车成功', `<p>${subName} - ${discount}${price}</p>`, true);
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
                        for (let [subID, subName, discount, price] of subInfos) {
                            let btn = document.createElement('button');
                            btn.addEventListener('click', async () => {
                                let dialog = showAlert('操作中……', `<p>添加 ${subName} - ${discount}${price} 到购物车</p>`, true);
                                dialog2.Dismiss();
                                let [succ, msg] = await addCart('sub', subID, appID);
                                let done = showAlert(msg, `<p>${subName} - ${discount}${price}</p>`, succ);
                                setTimeout(() => { done.Dismiss(); }, 1200);
                                dialog.Dismiss();
                            });
                            btn.textContent = '🛒添加购物车';
                            btn.className = 'fac_choose';
                            let p = document.createElement('p');
                            p.textContent = `${subName} - ${discount}${price}`;
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
            const regPure = new RegExp(/ - [^-]*$/, '');
            const regSymbol = new RegExp(/[>-] ([^>-]+) [\d.]+$/, '');
            const lang = document.cookie.replace(/(?:(?:^|.*;\s*)Steam_Language\s*\=\s*([^;]*).*$)|^.*$/, "$1")
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
                                const { packageid, option_text, percent_savings_text, price_in_cents_with_discount } = sub;
                                if (price_in_cents_with_discount > 0) { //排除免费SUB
                                    const symbol = option_text.match(regSymbol)?.pop();
                                    const subName = option_text.replace(regPure, '');
                                    const price = '💳' + price_in_cents_with_discount / 100 + ' ' + symbol;
                                    const discount = percent_savings_text !== ' ' ? '🔖' + percent_savings_text + ' ' : '';
                                    subInfos.push([packageid, subName, discount, price]);
                                }
                            }
                        }
                        console.log(subInfos);
                        resolve(subInfos);
                    } else {
                        reject('网络请求失败');
                    }
                }).catch(err => {
                    reject(err);
                });
        });
    }
    //添加购物车,只支持subID和bundleID
    function addCart(type = 'sub', subID, appID = null) {
        window.localStorage['fac_subid'] = subID;
        return new Promise((resolve, reject) => {
            let data = {
                action: "add_to_cart",
                originating_snr: "1_store-navigation__",
                sessionid: document.cookie.replace(/(?:(?:^|.*;\s*)sessionid\s*\=\s*([^;]*).*$)|^.*$/, "$1"),
                snr: "1_5_9__403",
            }
            data[`${type}id`] = String(subID);
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
                        if (appID !== null) {
                            const regIfSucc = new RegExp('app\/' + appID);
                            if (data.search(regIfSucc) !== -1) {
                                resolve([true, '添加购物车成功']);
                            }
                            else {
                                resolve([false, '添加购物车失败']);
                            }
                        } else {
                            resolve([true, '添加购物车成功']);
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
    padding: 1px;
  }
  
  a.search_result_row>button.fac_listbtns {
    top: -25px;
    left: 300px;
  }
  
  a.tab_item>button.fac_listbtns {
    top: -40px;
    left: 330px;
  }
  
  a.recommendation_link>button.fac_listbtns {
    bottom: 10px;
    right: 10px;
    position: absolute;
  }
  
  div.wishlist_row>button.fac_listbtns {
    top: 35%;
    right: 30%;
    position: absolute;
  }
  
  div.game_purchase_action>button.fac_listbtns {
    right: 8px;
    bottom: 8px;
  }
  
  button.fac_cartbtns {
    padding: 5px 10px;
  }
  
  button.fac_cartbtns:not(:last-child) {
    margin-right: 7px;
  }
  
  button.fac_cartbtns:not(:first-child) {
    margin-left: 7px;
  }
  
  a.tab_item:hover button.fac_listbtns, a.search_result_row:hover button.fac_listbtns, div.recommendation:hover button.fac_listbtns, div.wishlist_row:hover button.fac_listbtns {
    display: block;
  }
  
  div.game_purchase_action:hover>button.fac_listbtns {
    display: inline;
  }
  
  button.fac_choose {
    padding: 1px;
    margin: 2px 5px;
  }
  
  textarea.fac_inputbox {
    height: 130px;
    resize: vertical;
    font-size: 10px;
  }
  
  textarea.fac_diag {
    height: 150px;
    width: 600px;
    resize: vertical;
    font-size: 10px;
    margin-bottom: 5px;
    padding: 5px;
    background-color: rgba( 0, 0, 0, 0.4);
    color: #fff;
    border: 1 px solid #000;
    border-radius: 3 px;
    box-shadow: 1px 1px 0px #45556c;
  }
`);