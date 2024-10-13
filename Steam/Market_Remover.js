// ==UserScript==
// @name         Market_Remover
// @namespace    https://blog.chrxw.com
// @version      1.2
// @description  Steam市场一键下架
// @author       Chr_
// @include      https://steamcommunity.com/market/
// @connect      steamcommunity.com
// @connect      steampowered.com
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

//开关
let Vswitch = false;

(function () {
    'use strict';
    initCfg();
    addBtns();
    if (Vswitch) {
        document.getElementById('autoxiajia').textContent = '执行中……';
        autoRemove();
    }
})();
// 添加按钮
function addBtns() {
    function genBtn(txt, foo, tips, id) {
        let b = document.createElement('button');
        b.textContent = txt;
        b.addEventListener('click', foo);
        if (id) { b.id = id; }
        if (tips) { b.setAttribute('data-tooltip-html', tips); }
        return b;
    }
    function genSpace() {
        let s = document.createElement('span');
        s.textContent = '    ';
        return s;
    }
    let area = document.querySelector('.market_header_text');
    let b = genBtn('一键下架', setGoal, 'By Chr_', 'autoxiajia');
    let c = genBtn('停止操作', clearGoal, 'By Chr_', 'stopxiajia');
    let d = genBtn('问题反馈', feedBack, '留言即可', 'stopxiajia');
    area.appendChild(b);
    area.appendChild(genSpace());
    area.appendChild(c);
    area.appendChild(genSpace());
    area.appendChild(d);
}
// 自动下架
function autoRemove() {
    let max = 50;
    let tries = 0;

    retry(remove1, 50);

    function remove1() {
        let btn = document.querySelector('.market_listing_cancel_button>a');
        if (btn) {
            btn.click();
            retry(remove2, 100);
        } else {
            let total = clearDot(document.getElementById('tabContentsMyActiveMarketListings_total').textContent);
            let onePage = clearDot(document.querySelector('.market_pagesize_options>.disabled').textContent);
            if (total >= onePage) {
                console.log('刷新');
                window.location.reload();
            } else {
                throw '没有更多物品可供下架,停止操作';
            }
        }
    }
    function remove2() {
        let frame = document.querySelector("#market_removelisting_dialog");
        if (frame && frame.style.display != 'none') {
            document.getElementById('market_removelisting_dialog_accept').click();
            tries = 0;
            retry(remove3, 300);
        } else {
            retry(remove2, 100);
        }
    }
    function remove3() {
        let frame = document.querySelector("#market_removelisting_dialog");
        if (frame && frame.style.display == 'none') {
            tries = 0;
            retry(remove1, 100);
        } else {
            retry(remove3, 300);
        }
    }
    // 自动重试
    function retry(foo, t) {
        console.log(foo.name);
        if (tries++ <= max) {
            setTimeout(() => {
                try {
                    foo();
                } catch (e) {
                    console.log(e);
                    if (e.toString().search('停止操作') != -1) {
                        Vswitch = false;
                        GM_setValue('switch', Vswitch);
                    } else if (e.toString().search('操作完成') != -1) {
                        Vswitch = false;
                        GM_setValue('switch', Vswitch);
                    }
                }
            }, t);
        } else {
            console.log('操作超时,自动刷新');
            window.location.reload();
        }
    }
}
// 读取配置
function initCfg() {
    let t = GM_getValue('switch');
    Vswitch = t ? true : false;
}
// 设置任务
function setGoal() {
    let total = clearDot(document.getElementById('tabContentsMyActiveMarketListings_total').textContent);
    if (total > 0) {
        let btn = document.getElementById('autoxiajia');
        if (!Vswitch) {
            Vswitch = true;
            GM_setValue('switch', Vswitch);
            btn.textContent = '开始下架';
            ShowAlertDialog('成功', '再次点击【开始下架】开始运行<br><br>点击【停止操作】结束脚本');
        } else {
            if (btn.textContent == '开始下架') {
                btn.textContent = '执行中……';
                autoRemove();
            }
        }
    } else {
        ShowAlertDialog('错误', '市场空空如也,无需下架操作');
    }
}
// 清除任务
function clearGoal() {
    if (Vswitch) {
        Vswitch = false;
        GM_setValue('switch', false);
        ShowAlertDialog('成功', '任务已停止');
        window.location.reload();
    } else {
        ShowAlertDialog('错误', '脚本未运行');
    }
}
// 反馈
function feedBack() {
    window.open('https://blog.chrxw.com/scripts.html');
}
// 清除逗号
function clearDot(num) {
    let t = num.replace(/,/g, '');
    return Number(t);
}