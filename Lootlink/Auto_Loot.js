// ==UserScript==
// @name         Auto Loot
// @namespace    https://blog.chrxw.com
// @version      1.2
// @description  自动领取每日奖励
// @author       Chr_
// @include      https://www.lootlink.me/*
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    showLabel();
    dailyClaim();
    add10xBtn();
})();
// 显示标签
function showLabel() {
    let uname = document.querySelector('#profileMenuInvoker>span');
    let tag1 = document.createElement('span');
    tag1.textContent = ' (反馈 ';
    tag1.addEventListener('click', () => {
        window.open('https://keylol.com/t676764-1-1');
    });
    let tag2 = document.createElement('span');
    tag2.textContent = '| By Chr_) ';
    tag2.addEventListener('click', () => {
        window.open('https://blog.chrxw.com');
    });
    uname.appendChild(tag1);
    uname.appendChild(tag2);
}
// 每日签到&自动开箱
function dailyClaim() {
    const MAX = 20;
    let tries = 0;
    clickDaily();
    function clickDaily() {
        let coin = document.querySelector('#wallet2 a[data-modal-target="#crate-modal"]');
        if (coin) {
            coin.click();
            tries = 0;
            retry(claimCoin, 1000);
        } else {
            let coin = document.querySelector('#wallet2 div:not([style*="display:none"])>[src="/images/art/crate.png"]:not(.grayscale)');
            if (coin) {
                coin.parentElement.click();
                tries = 0;
                retry(claimCoin, 1000);
            }
        }
    }
    function claimCoin() {
        let claimbtn = document.querySelector("#cratetab > a");
        if (claimbtn) {
            claimbtn.click();
            tries = 0;
            retry(closePanel, 1000);
        } else {
            retry(claimCoin, 500);
        }
    }
    function closePanel() {
        let title = document.querySelector("#cratetab > h4");
        if (title.textContent.search('Opened') != -1 || title.textContent.search('Received') != -1) {
            let closebtn = document.querySelector("#crate-modal > button");
            closebtn.click();
            window.location.reload();
        } else {
            retry(closePanel, 500);
        }
    }
    function retry(foo, t) {
        console.log(foo.name);
        if (tries++ <= MAX) {
            setTimeout(() => {
                try {
                    foo();
                }
                catch (e) {
                    console.log(e);
                    throw e;
                }
            }, t);
        } else {
            console.log('操作超时');
        }
    }
}
// 添加x连按钮
function add10xBtn() {
    function genBtn(txt, time, index) {
        let btn = document.createElement('button');
        btn.id = 'loot' + time.toString() + 'x' + (index).toString();
        btn.onclick = loot10x;
        btn.className = 'float-right btn btn-lg u-btn-cyan g-color-white u-btn-hover-v2-1';
        btn.textContent = txt;
        return btn;
    }
    let lootBtns = document.querySelectorAll('button[data-modal-target="#loot-modal"]');
    let i = 0;
    for (let lootBtn of lootBtns) {
        let bar = lootBtn.parentElement.parentElement.children[0];
        let box = document.createElement('div');
        let btn5x = genBtn('五连', 5, i);
        let btn10x = genBtn('十连', 10, i);
        let btn100x = genBtn('梭哈', 100, i);
        box.appendChild(btn5x);
        box.appendChild(btn10x);
        box.appendChild(btn100x);
        bar.insertBefore(box, bar.children[0]);
        i++;
    }
}
// x连
function loot10x(e) {
    const MAX = 50;
    let LOOT = 0;
    let tries = 0;
    let count = 0;
    clickLoot();
    function clickLoot() {
        let id = e.target.getAttribute('id');
        let t = id.match(/^loot(\d+)x(\d+)$/);
        t = t ? [t[1], t[2]] : [0, 0];
        let lootBtns = document.querySelectorAll('button[data-modal-target="#loot-modal"]');
        if (lootBtns == null) {
            alert('未找到Loot按钮');
            return;
        }
        LOOT = Number(t[0]);
        lootBtns[Number(t[1])].click();
        tries = 0;
        retry(claimLoot, 1000);
    }
    function claimLoot() {
        let lootbtn = document.querySelector('#rollit');
        if (lootbtn) {
            document.getElementById('rollmessage').textContent = '第' + (count + 1).toString() + '/' + LOOT.toString() + '抽';
            lootbtn.click();
            tries = 0;
            retry(waitLoot, 1000);
        } else {
            retry(claimLoot, 1000);
        }
    }
    function waitLoot() {
        let lootbtn = document.querySelector("#rollit");
        if (lootbtn.textContent.search('Try') != -1) {
            if (++count >= LOOT) {
                document.getElementById('rollmessage').textContent = '抽完啦';
                console.log('done');
                return;
            }
            tries = 0;
            retry(claimLoot, 1000);
        } else {
            retry(waitLoot, 1000);
        }
    }
    function retry(foo, t) {
        console.log(foo.name);
        if (tries++ <= MAX) {
            setTimeout(() => {
                try {
                    if (document.getElementById('rolltab') == null) {
                        console.log('cancel');
                        return;
                    }
                    foo();
                }
                catch (e) {
                    console.log(e);
                    throw e;
                }
            }, t);
        } else {
            console.log('操作超时');
        }
    }
}