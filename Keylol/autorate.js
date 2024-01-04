// ==UserScript==
// @name         Keylol-Autorate
// @namespace    Keylol
// @include      https://keylol.com/*
// @require      https://code.jquery.com/jquery-3.5.1.min.js#sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=
// @version      1.0.7
// @icon         https://raw.githubusercontent.com/ohperhaps/Keylol-Autorate/master/img/konoha.png
// @downloadURL	 https://github.com/ohperhaps/Keylol-Autorate/raw/master/keylol-autorate.user.js
// @updateURL	 https://github.com/ohperhaps/Keylol-Autorate/raw/master/keylol-autorate.user.js
// @description  Keylol forum autorate tool
// @author       ohperhaps
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==
/*
更新日志：
1.version 1.0.1（2020-08-11）(感谢 @安安姬 @Opalus）
   a.解决体力不满加体力的问题，加体力前将先获取剩余体力。
   b.解决某些情况下收藏说明没有更新的问题

2.version 1.0.2（2020-08-11）(感谢 @bokutaki @hmh28 @skiliey @安安姬)
   a.解决无符合格式的收藏说明时，点击AutoRate页面卡死的问题

3.version 1.0.3 (2020-08-12) （感谢 @Zayne. @zjiang322）
   a.增加用户名显示
   b.增加无体力可加时的提示信息

4.version 1.0.4 (2020-08-13) (感谢 @虫虫大作战 )
   a.修复代码逻辑错误造成的体力未加完的情况
   b.修改提示信息，增加控制台debug信息

5.version 1.0.5 (2020-08-13) (感谢 @丨OTZ丨_sqkUw )
   a.修复当前可加体力多于需要加体力时的崩溃问题

6.version 1.0.6 (2020-08-14) (感谢 @圣所 )
   a.更新用户页面获取用户组gid的逻辑
   b.增加非晋级用户组单次配额无法获取时默认值

7.version 1.0.7 (2020-08-19) (感谢 @695丶 )
   a.修复在有多页收藏时只获取第一页收藏的问题

 */
   (function() {
    'use strict';
    const $ = unsafeWindow.jQuery;
    const homePage = "https://keylol.com/";
    const selfUid = $("li.dropdown").find("a").attr("href").split("-")[1]
    const formHash = $("[name=formhash]").val();
    function xhrAsync (url, method="GET", data="") {
        if (method === "GET") {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    "method": "GET",
                    "url": homePage + url,
                    "onload": resolve
                })
            })
        } else if (method === "POST") {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    "method": "POST",
                    "url": homePage + url,
                    "data": data,
                    "onload": resolve
                })
            })
        }
    }
    function compare(property){
        return function(a,b){
            let value1 = a[property];
            let value2 = b[property];
            return value1 - value2;
        }
    }
    async function getUserScore() {
        let threads = await xhrAsync(`forum.php?mod=guide&view=newthread`).then((res) => {
            let threads = []
            $("div.bm_c", res.response).find("tbody").each(function () { threads.push($(this).attr("id").split("_").pop()) })
            return threads })
        for (let thread of threads) {
            let posts = await xhrAsync(`t${thread}-1-1`).then((res) => {
                let posts = []
                $("#postlist > div[id^=post_]", res.response).each(function () { posts.push($(this).attr("id").split("_").pop()) })
                return posts
            })
            for (let post of posts) {
                let ts = (new Date()).getTime()
                let score = await xhrAsync(`forum.php?mod=misc&action=rate&tid=${thread}&pid=${post}&infloat=yes&handlekey=rate&t=${ts}&inajax=1&ajaxtarget=fwin_content_rate`).then((res) => {
                    return $("table.dt.mbm td:last", res.response).text()
                })
                if (/^\d+$/.test(score)) { return parseInt(score) }
            }
        }
    }
    function getUserCredit(uid) {
        let creditBox = {
            "30": { step: 0},
            "31": { step: 0},
            "32": { step: 1},
            "33": { step: 2},
            "34": { step: 2},
            "35": { step: 3},
            "36": { step: 3},
            "37": { step: 4},
            "51": { step: 5},
            "52": { step: 0},
        }
        return Promise.all([xhrAsync(`suid-${uid}`), getUserScore()]).then((results) => {
            let gid = $("li:contains('用户组')", results[0].response).find("a").attr("href").split("=").pop()
            let credits = creditBox[gid] || { step: 4 }
            credits.total = results[1]
            return credits
        })
    }
    async function getCollections() {
        let collections = []
        for(let page = 1; page <= 40; page++) {
            let res = await xhrAsync(`plugin.php?id=keylol_favorite_notification:favorite_enhance&formhash=${formHash}&size=100&page=${page}`)
            let cs = $("#delform", res.response).find("tr")
            if (cs.length === 0) { break }
            else {
                cs.each(function () {
                    let quote = formatQuote($("span.favorite_quote.xi1", this).text())
                    if (quote) {
                        collections.push({favid: $(this).attr("id").split("_").pop(),
                                          uid: $("[href^='suid']", this).attr("href").split("-").pop(),
                                          username: $("[href^='suid']", this).text(),
                                          quote: quote[0],
                                          remain: quote[1],
                                          score: 0})
                    }
                })
            }
        }
        return collections.sort(compare('remain'))
    }
    function calcScores() {
        return Promise.all([getCollections(), getUserCredit(selfUid)]).then((results) => {
            let total = results[1].total
            let calcFlag = results[0].length > 0
            while(calcFlag) {
                for(let item of results[0]) {
                    if (total < 1) { calcFlag = false; break }
                    else {
                        if (item.score < item.remain) { item.score++; total-- }
                    }
                }
                if (results[0].every(item => item.score === item.remain)) { calcFlag = false }
            }
            results[0].forEach(function (item) {item.step = results[1].step})
            return [results[0], results[1].total]
        })
    }
    function getUserReplys(uid, page=1) {
        return xhrAsync(`home.php?mod=space&uid=${uid}&do=thread&view=me&from=space&type=reply&order=dateline&page=${page}`).then((res) => {
            let replys = []
            $("#delform", res.response).find("td.xg1").each(function () {
                let urlParams = new URLSearchParams($(this).find("a").attr("href"))
                replys.push({tid: urlParams.get("ptid"),
                              pid: urlParams.get("pid")})
            })
            return replys
        })

    }
    function formatQuote(quote, addend=0) {
        let quote_num = quote.match(/\d+/g)
        if (/^\d+\/\d+$/.test(quote) && parseInt(quote_num[0]) < parseInt(quote_num[1])) {
            return [(parseInt(quote_num[0]) + parseInt(addend)).toString() + '/' + quote_num[1].toString(), (parseInt(quote_num[1]) - parseInt(quote_num[0]) - parseInt(addend))]
        }
    }
    function updateQuote(favid, quote) {
        const formData = new FormData()
        formData.append("favid", favid)
        formData.append("quote", quote)
        return xhrAsync(`plugin.php?id=keylol_favorite_notification:favorite_enhance&formhash=${formHash}`, "POST", formData).then((res) => {
            return res.responseText
        })
    }
    function rate(tid, pid, score, reason) {
        const formData = new FormData()
        formData.append("formhash", formHash)
        formData.append("tid", tid)
        formData.append("pid", pid)
        formData.append("referer", `${homePage}forum.php?mod=viewthread&tid=${tid}&page=0#pid${pid}`)
        formData.append("handlekey", "rate")
        formData.append("score1", score)
        formData.append("reason", reason)
        return xhrAsync(`forum.php?mod=misc&action=rate&ratesubmit=yes&infloat=yes&inajax=1`, "POST", formData).then((res) => {
            if (res.responseText.indexOf('succeedhandle_rate') !== -1) {
                return ('successful')
            } else if (res.responseText.indexOf('errorhandle_rate') && res.responseText.indexOf('24 小时评分数超过限制') !== -1) {
                return ('exceeded')
            } else if (res.responseText.indexOf('errorhandle_rate') && res.responseText.indexOf('您不能对同一个帖子重复评分') !== -1) {
                return ('failed')
            } else {
                return ('Unknown')
            }
        })
    }
    async function main() {
        let message = []
        let itemScores = await calcScores()
        console.log(itemScores)
        if (itemScores[0].length === 0) { message.push('未找到正确格式的收藏帖子！\n') }
        body:
        for (let item of itemScores[0]) {
            if (itemScores[1] === 0) { message.push('当前无剩余体力！请稍后再尝试！\n'); break }
            leg:
            for(let page = 1; page < 50; page++) {
                let replys = await getUserReplys(item.uid, page)
                console.log([item.uid, page, replys])
                for(let reply of replys) {
                    if (item.score > 0) {
                        let attend = Math.min(item.step, item.score)
                        let new_quote = formatQuote(item.quote, attend)[0]
                        let rate_result = await rate(reply.tid, reply.pid, attend, new_quote)
                        if (rate_result === 'successful') {
                            item.score -= attend
                            item.quote = new_quote
                            message.push(`user: ${item.username} tid: ${reply.tid}  pid: ${reply.pid} score: ${attend} reason:${new_quote}\n`)
                        } else if (rate_result === 'exceeded') {
                            updateQuote(item.favid, item.quote)
                            message.push('当前体力已全部加完!\n')
                            break body
                        }
                    } else {
                        updateQuote(item.favid, item.quote)
                        break leg
                    }
                }
            }
        }
        alert(message.join(''))
    }
    function views() {
        let rateDiv = $('<div/>', {id: 'rateDiv'})
        let rateBtn = $('<a/>', {
            id: 'autoRate',
            text: 'AutoRate',
            class: 'btn btn-user-action',
            mouseover: function () { $(this).css({'background-color': '#57bae8', 'color': '#f7f7f7'}) },
            mouseleave: function () { $(this).css({'background-color': '', 'color': ''}) },
            click: function () { main() }})
        rateDiv.append(rateBtn)
        $('#nav-search-bar').after(rateDiv)
    }
    views()
})();