// ==UserScript==
// @name         Dingxinwen
// @name:zh-CN   答题助手
// @namespace    https://blog.chrxw.com
// @version      2.0
// @description  从steamdb.keylol.com获取愿望单数据
// @author       Chr_
// @include      https://static.dingxinwen.com/*
// @icon         https://blog.chrxw.com/favicon.ico
// @license      AGPL-3.0
// ==/UserScript==


(function () {
    'use strict';

    console.log("load")

    // 重写 XMLHttpRequest 的 open 方法
    var originalOpen = window.XMLHttpRequest.prototype.open;

    const tiku = new Map();

    window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        console.log("open", method, url)

        if (url.includes("questions")) {
            this.addEventListener("load", function () {
                if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                    const json = JSON.parse(this.responseText)
                    const { data: { questionList } } = json

                    for (const { title, options } of questionList) {
                        tiku[title] = options.filter(x => x.isRight).map(x => x.title)
                    }

                    console.log(tiku)
                } else {
                    console.warn("网络请求失败")
                }
            })
        }

        originalOpen.apply(this, arguments);
    };

    setInterval(() => {
        const title = document.querySelector(".title-con")?.textContent.trim()
        const right = tiku[title]
        if (right) {
            tiku[title] = null

            const descs = document.querySelectorAll(".question__options--item>.desc")
            for (const desc of descs) {
                const text = desc.textContent.trim()
                if (right.includes(text)) {
                    console.log(text)
                    desc.click()
                }
            }

            setTimeout(() => {
                const count = document.querySelectorAll(".question__options--item.selected").length
                if (count === 0) {
                    location.reload()
                } else {
                    document.querySelector("uni-button.next")?.click()
                }
            }, 1000);
        }

    }, 500);

})()


