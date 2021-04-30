// ==UserScript==
// @name         Twitter_Auto_Like
// @namespace    https://blog.chrxw.com
// @version      0.1
// @description  推特时间线自动点赞
// @author       Chr_
// @include      https://twitter.com/*
// @license      AGPL-3.0
// @icon         https://blog.chrxw.com/favicon.ico
// ==/UserScript==

(() => {
    'use strict';
    let check = setInterval(() => {
        if (document.querySelector('a[href*=compose]') != null) {
            clearInterval(check);
            loadComplete();
        }
    }, 500);
    function loadComplete() {
        let btnArea = document.querySelector('a[href*=compose]').parentElement.parentElement;
        let btn = document.createElement('button');
        btn.textContent = '批量点赞';
        btn.addEventListener('click', autoLike);
        btnArea.appendChild(btn);
    }
    function autoLike() {
        let likes = document.querySelectorAll('div[role="button"][data-testid="like"]');
        let j = likes.length;
        let i = 0;
        let t = setInterval(() => {
            if (i < j) {
                likes[i++].click();
            } else {
                clearInterval(t);
                setInterval(autoLike, 200);
            }
        }, 200);
    }
})();
